import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { LinkParentDto } from './dto/link-parent.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateStudentDto) {
    await this.ensureAdmissionNoUnique(schoolId, dto.admissionNo);

    return this.prisma.student.create({
      data: {
        schoolId,
        ...dto,
      },
    });
  }

  async findAll(schoolId: string) {
    const students = await this.prisma.student.findMany({
      where: { schoolId },
      include: {
        parents: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return students.map((student) => this.sanitizeStudent(student));
  }

  async findById(schoolId: string, studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parents: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.sanitizeStudent(student);
  }

  async update(schoolId: string, studentId: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.prisma.student.update({
      where: { id: studentId },
      data: dto,
    });
  }

  async linkParent(schoolId: string, studentId: string, dto: LinkParentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const parent = await this.prisma.parent.findUnique({
      where: { id: dto.parentId },
    });

    if (!parent || parent.schoolId !== schoolId) {
      throw new NotFoundException(`Parent with ID ${dto.parentId} not found`);
    }

    const existingLink = await this.prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId: dto.parentId,
          studentId,
        },
      },
    });

    if (existingLink) {
      throw new ConflictException('This parent is already linked to this student');
    }

    if (dto.isPrimary) {
      await this.prisma.parentStudent.updateMany({
        where: {
          studentId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return this.prisma.parentStudent.create({
      data: {
        schoolId,
        studentId,
        parentId: dto.parentId,
        relationship: dto.relationship,
        isPrimary: dto.isPrimary ?? false,
      },
    });
  }

  async unlinkParent(schoolId: string, studentId: string, parentId: string) {
    const link = await this.prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId,
          studentId,
        },
      },
    });

    if (!link || link.schoolId !== schoolId) {
      throw new NotFoundException('Parent-student link not found');
    }

    return this.prisma.parentStudent.delete({
      where: {
        parentId_studentId: {
          parentId,
          studentId,
        },
      },
    });
  }

  private async ensureAdmissionNoUnique(schoolId: string, admissionNo: string) {
    const existing = await this.prisma.student.findUnique({
      where: {
        schoolId_admissionNo: {
          schoolId,
          admissionNo,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Student with admission number ${admissionNo} already exists in this school`,
      );
    }
  }

  private sanitizeStudent(student: any) {
    if (student.parents) {
      student.parents = student.parents.map((ps: any) => ({
        ...ps,
        parent: {
          ...ps.parent,
          user: ps.parent?.user
            ? (({ passwordHash, ...u }) => u)(ps.parent.user)
            : null,
        },
      }));
    }
    return student;
  }
}