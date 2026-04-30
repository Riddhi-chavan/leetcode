import { prisma } from '../lib/db.js'

// ─── GET /profile/:userId ────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  const { userId } = req.params

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        github: true,
        linkedin: true,
        website: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) return res.status(404).json({ error: 'User not found' })

    // ── All accepted submissions (unique problems solved) ────────────────────
    const acceptedSubmissions = await prisma.submission.findMany({
      where: { userId, status: 'ACCEPTED' }, 
      select: {
        problemId: true,
        createdAt: true,
        language: true,
        problem: { select: { difficulty: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Unique solved problems (deduplicate by problemId)
    const solvedMap = new Map()
    for (const s of acceptedSubmissions) {
      if (!solvedMap.has(s.problemId)) solvedMap.set(s.problemId, s)
    }
    const solvedUnique = [...solvedMap.values()]

    const easySolved   = solvedUnique.filter(s => s.problem.difficulty === 'EASY').length
    const mediumSolved = solvedUnique.filter(s => s.problem.difficulty === 'MEDIUM').length
    const hardSolved   = solvedUnique.filter(s => s.problem.difficulty === 'HARD').length

    // ── Total problem counts per difficulty ──────────────────────────────────
    const [easyTotal, mediumTotal, hardTotal] = await Promise.all([
      prisma.problem.count({ where: { difficulty: 'EASY' } }),
      prisma.problem.count({ where: { difficulty: 'MEDIUM' } }),
      prisma.problem.count({ where: { difficulty: 'HARD' } }),
    ])

    // ── Activity heatmap — submissions per day (last 12 months) ─────────────
    const since = new Date()
    since.setFullYear(since.getFullYear() - 1)

    const allRecentSubs = await prisma.submission.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    })

    // Group by YYYY-MM-DD
    const activityMap = {}
    for (const s of allRecentSubs) {
      const day = s.createdAt.toISOString().slice(0, 10)
      activityMap[day] = (activityMap[day] ?? 0) + 1
    }

    // ── Recent accepted submissions (last 8, unique problems) ────────────────
    const recentSolved = solvedUnique.slice(0, 8).map(s => ({
      problemId: s.problemId,
      title: s.problem.title,
      difficulty: s.problem.difficulty,
      language: s.language,
      solvedAt: s.createdAt,
    }))

    // ── Total submission count ────────────────────────────────────────────────
    const totalSubmissions = await prisma.submission.count({ where: { userId } })

    // ── Acceptance rate ───────────────────────────────────────────────────────
    const totalAccepted = await prisma.submission.count({  where: { userId, status: 'ACCEPTED' } })
    const acceptanceRate = totalSubmissions > 0
      ? Math.round((totalAccepted / totalSubmissions) * 100)
      : 0

    res.status(200).json({
      success: true,
      user,
      stats: {
        solved: {
          easy:   { solved: easySolved,   total: easyTotal },
          medium: { solved: mediumSolved, total: mediumTotal },
          hard:   { solved: hardSolved,   total: hardTotal },
          total:  solvedUnique.length,
          grandTotal: easyTotal + mediumTotal + hardTotal,
        },
        totalSubmissions,
        acceptanceRate,
      },
      activity: activityMap,   // { "2024-04-01": 3, "2024-04-02": 1, ... }
      recentSolved,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

// ─── PATCH /profile/update ───────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  const userId = req.user.id
  const { name, bio, github, linkedin, website, avatar } = req.body

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name     !== undefined && { name }),
        ...(bio      !== undefined && { bio }),
        ...(github   !== undefined && { github }),
        ...(linkedin !== undefined && { linkedin }),
        ...(website  !== undefined && { website }),
        ...(avatar   !== undefined && { avatar }),
      },
      select: {
        id: true, name: true, email: true,
        avatar: true, bio: true, github: true,
        linkedin: true, website: true,
      },
    })

    res.status(200).json({ success: true, user: updated })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}