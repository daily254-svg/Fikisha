import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: {
        user: true,
        busAssignments: {
          where: { isActive: true },
          take: 1,
          include: {
            bus: {
              include: {
                routes: {
                  include: {
                    stops: { orderBy: { sequence: 'asc' } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    return {
      ...driver,
      user: this.sanitizeUser(driver.user),
    };
  }

  async getActiveBus(userId: string) {
    const assignment = await this.prisma.busAssignment.findFirst({
      where: {
        driver: { userId },
        isActive: true,
      },
      include: {
        bus: {
          include: {
            routes: {
              include: {
                stops: { orderBy: { sequence: 'asc' } },
              },
            },
            location: true,
          },
        },
      },
    });

    if (!assignment) {
      return null;
    }

    return assignment;
  }

  async getRouteStudents(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    // Get active bus assignment
    const assignment = await this.prisma.busAssignment.findFirst({
      where: {
        driver: { userId },
        isActive: true,
      },
      include: {
        bus: true,
      },
    });

    if (!assignment) {
      return [];
    }

    // Get active routes for this bus
    const routes = await this.prisma.route.findMany({
      where: {
        busId: assignment.bus.id,
        schoolId: driver.schoolId,
      },
    });

    // For each route get students
    const routesWithStudents = await Promise.all(
      routes.map(async (route) => {
        const studentRoutes = await this.prisma.studentRoute.findMany({
          where: { routeId: route.id, active: true },
          include: {
            student: {
              include: {
                parents: {
                  include: {
                    parent: {
                      include: { user: true },
                    },
                  },
                },
              },
            },
          },
        });

        return {
          route: {
            id: route.id,
            name: route.name,
            direction: route.direction,
          },
          students: studentRoutes.map((sr) => ({
            ...sr.student,
            parents: sr.student.parents.map((ps) => ({
              ...ps,
              parent: {
                ...ps.parent,
                user: this.sanitizeUser(ps.parent.user),
              },
            })),
          })),
        };
      }),
    );

    return routesWithStudents;
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}