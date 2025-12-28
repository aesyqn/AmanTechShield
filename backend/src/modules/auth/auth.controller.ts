import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';

import { prisma } from '../../prisma.ts';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, position } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      position?: string;
    };

    if (!name || !email || !password || !position) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters long' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        position,
      },
    });

    const { password: _password, ...safeUser } = user;

    return res.status(201).json(safeUser);
  } catch (error) {
    console.error('Error in /api/auth/register', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _password, ...safeUser } = user;

    return res.json(safeUser);
  } catch (error) {
    console.error('Error in /api/auth/login', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});
