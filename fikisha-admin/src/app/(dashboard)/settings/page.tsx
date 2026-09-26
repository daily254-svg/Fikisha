'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { schoolsService } from '@/services/schools.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { data: school } = useQuery({
    queryKey: ['school', user?.schoolId],
    queryFn: () => schoolsService.findById(user!.schoolId),
    enabled: !!user?.schoolId,
  })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (school) {
      setName(school.name)
      setEmail(school.email ?? '')
      setPhone(school.phone ?? '')
      setAddress(school.address ?? '')
    }
  }, [school])

  const update = useMutation({
    mutationFn: () =>
      schoolsService.update(user!.schoolId, {
        name,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school', user?.schoolId] })
      setSuccess(true)
      setError('')
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to update school'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your school&apos;s profile.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>School profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              update.mutate()
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">School name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            {success && <p className="text-sm text-emerald-600">Saved successfully.</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={update.isPending} className="self-start">
              {update.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
