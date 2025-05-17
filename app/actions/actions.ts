//app/actions/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { User, userSchema } from './schemas'
import { cache } from 'react'
import prisma from '@/lib/prisma'

export async function searchUsers(query: string): Promise<User[]> {
    console.log('Searching users with query:', query)
    const results = await prisma.user.findMany({
        where: {
            name: {
                startsWith: query,
                mode: 'insensitive'
            }
        }
    })
    console.log('Search results:', results)
    return results
}

export async function addUser(data: Omit<User, 'id'>): Promise<User> {
    const validatedUser = userSchema.parse({ ...data, id: '' }) // Validate without ID as Prisma will generate it
    const newUser = await prisma.user.create({
        data: {
            name: validatedUser.name,
            email: validatedUser.email,
            phoneNumber: validatedUser.phoneNumber
        }
    })
    revalidatePath('/')
    return newUser
}

export async function deleteUser(id: string): Promise<void> {
    await prisma.user.delete({
        where: { id }
    })
    console.log(`User with id ${id} has been deleted.`)
    revalidatePath('/')
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id'>>): Promise<User> {
    const existingUser = await prisma.user.findUnique({
        where: { id }
    })
    
    if (!existingUser) {
        throw new Error(`User with id ${id} not found`)
    }

    const updatedData = { ...existingUser, ...data }
    const validatedUser = userSchema.parse(updatedData)

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            name: validatedUser.name,
            email: validatedUser.email,
            phoneNumber: validatedUser.phoneNumber
        }
    })

    console.log(`User with id ${id} has been updated.`)
    revalidatePath('/')
    return updatedUser
}

export const getUserById = cache(async (id: string) => {
    return prisma.user.findUnique({
        where: { id }
    })
})
