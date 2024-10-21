import type {
  Adapter as BaseAdapter,
  DatabaseSession,
  DatabaseUser,
  RegisteredDatabaseSessionAttributes,
} from 'lucia'
import { eq, lte, pgDrizzle, type Client } from '../db'
import { userSession, user } from '../db/schema'

export class PostgresAdapter implements BaseAdapter {
  private dbClient: Client

  constructor(dbClient: Client) {
    this.dbClient = dbClient
  }

  public async setSession(session: DatabaseSession): Promise<void> {
    try {
      await pgDrizzle(this.dbClient).insert(userSession).values({
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
      })
    } catch (error) {
      console.error(error)
    }
  }

  public async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    const result = await pgDrizzle(this.dbClient)
      .select()
      .from(userSession)
      .where(eq(userSession.userId, userId))

    if (result) {
      return result.map(val => {
        return transformIntoDatabaseSession({
          id: val.id,
          user_id: val.userId,
          expires_at: val.expiresAt,
        })
      })
    }
    return []
  }

  public async getSessionAndUser(
    sessionId: string,
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const [sessionResult] = await pgDrizzle(this.dbClient)
      .select()
      .from(userSession)
      .where(eq(userSession.id, sessionId))

    if (sessionResult) {
      const session = transformIntoDatabaseSession({
        id: sessionResult.id,
        user_id: sessionResult.userId,
        expires_at: sessionResult.expiresAt,
      })
      const [userResult] = await pgDrizzle(this.dbClient)
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, session.userId))

      if (userResult) {
        return [
          session,
          {
            id: userResult.id,
            attributes: {},
          },
        ]
      }
    }
    return [null, null]
  }

  public async updateSessionExpiration(
    sessionId: string,
    expiresAt: Date,
  ): Promise<void> {
    await pgDrizzle(this.dbClient)
      .update(userSession)
      .set({
        expiresAt: expiresAt,
      })
      .where(eq(userSession.id, sessionId))
  }

  public async deleteSession(sessionId: string): Promise<void> {
    await pgDrizzle(this.dbClient)
      .delete(userSession)
      .where(eq(userSession.id, sessionId))
  }

  public async deleteUserSessions(userId: string): Promise<void> {
    await pgDrizzle(this.dbClient)
      .delete(userSession)
      .where(eq(userSession.userId, userId))
  }

  public async deleteExpiredSessions(): Promise<void> {
    await pgDrizzle(this.dbClient)
      .delete(userSession)
      .where(lte(userSession.expiresAt, new Date()))
  }
}

interface SessionSchema extends RegisteredDatabaseSessionAttributes {
  id: string
  user_id: string
  expires_at: Date
}

function transformIntoDatabaseSession(raw: SessionSchema): DatabaseSession {
  const { id, user_id: userId, expires_at: expiresAt, ...attributes } = raw
  return { userId, id, expiresAt, attributes }
}
