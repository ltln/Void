import { info } from 'lib/logger';
import prisma from 'lib/prisma';
import { hashPassword } from 'lib/utils';
import { NextApiReq, NextApiRes, withDraconic } from 'middleware/withDraconic';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  if (req.method === 'PATCH') {
    if (req.body.password) {
      const hashed = await hashPassword(req.body.password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed }
      });
    }
    if (req.body.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: req.body.username
        }
      });
      if (existing && user.username !== req.body.username) { 
        return res.forbid('Username is already taken');
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { username: req.body.username }
      });
    }
    if (req.body.embedTitle) await prisma.user.update({
      where: { id: user.id },
      data: { embedTitle: req.body.embedTitle }
    });
    if (req.body.embedColor) await prisma.user.update({
      where: { id: user.id },
      data: { embedColor: req.body.embedColor }
    });
    const newUser = await prisma.user.findFirst({
      where: {
        id: Number(user.id)
      },
      select: {
        isAdmin: true,
        embedColor: true,
        embedTitle: true,
        id: true,
        files: false,
        password: false,
        token: true,
        username: true
      }
    });
    info('USER', `User ${user.username} (${newUser.username}) (${newUser.id}) was updated`);
    return res.json(newUser);
  } else {
    delete user.password;
    return res.json(user);
  }
}

export default withDraconic(handler);