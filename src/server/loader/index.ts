import express from 'express'
import dbLoader from './db'
import expressLoader from './express'
import serviceLoader from './services'

export default async ({ app }: { app: express.Application }) => {
  const db = dbLoader()
  const services = serviceLoader({ db })

  await expressLoader({ app, services })
}
