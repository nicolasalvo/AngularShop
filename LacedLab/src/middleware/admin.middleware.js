export const adminMiddleware = (req, res, next) => {
  if (req.user?.email !== 'admin@admin.admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' })
  }

  next()
}