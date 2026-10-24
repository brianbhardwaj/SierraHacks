import { chatStatus } from '../../server/unsprayApi'

export default function handler(_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) {
  const out = chatStatus()
  return res.status(out.status).json(out.body)
}
