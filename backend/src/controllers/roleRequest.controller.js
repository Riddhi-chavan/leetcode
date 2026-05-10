import { prisma } from '../lib/db.js'

export const submitRoleRequest = async (req, res) => {
  const { reason } = req.body
  const userId = req.user.id

  if (!reason?.trim()) {
    return res.status(400).json({ error: 'Reason is required' })
  }

  if (req.user.role === 'ADMIN') {
    return res.status(400).json({ error: 'You are already an admin' })
  }

  try {
    const existing = await prisma.roleRequest.findUnique({ where: { userId } })

    if (existing?.status === 'PENDING') {
      return res.status(400).json({ error: 'You already have a pending request' })
    }

    // If previously rejected, let them re-apply by updating the same record
    const request = existing
      ? await prisma.roleRequest.update({
          where: { userId },
          data: { reason, status: 'PENDING' }
        })
      : await prisma.roleRequest.create({
          data: { userId, reason }
        })

    res.status(201).json({ success: true, request })
  } catch (error) {
    console.error('Error submitting role request', error)
    res.status(500).json({ error: 'Failed to submit request' })
  }
}

export const getRoleRequests = async (req, res) => {
  const { status = 'PENDING' } = req.query

  try {
    const requests = await prisma.roleRequest.findMany({
      where: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    res.status(200).json({ success: true, requests })
  } catch (error) {
    console.error('Error fetching role requests', error)
    res.status(500).json({ error: 'Failed to fetch requests' })
  }
}

export const reviewRoleRequest = async (req, res) => {
  const { id } = req.params
  const { action } = req.body

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Action must be approve or reject' })
  }

  try {
    const request = await prisma.roleRequest.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!request) return res.status(404).json({ error: 'Request not found' })

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: `Request already ${request.status.toLowerCase()}` })
    }

    const [updatedRequest] = await prisma.$transaction([
      prisma.roleRequest.update({
        where: { id },
        data: { status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
      }),
      ...(action === 'approve'
        ? [prisma.user.update({
            where: { id: request.userId },
            data: { role: 'ADMIN' }
          })]
        : [])
    ])

    res.status(200).json({
      success: true,
      message: `Request ${action === 'approve' ? 'approved' : 'rejected'}`,
      request: updatedRequest
    })
  } catch (error) {
    console.error('Error reviewing role request', error)
    res.status(500).json({ error: 'Failed to review request' })
  }
}

export const getMyRoleRequest = async (req, res) => {
  try {
    const request = await prisma.roleRequest.findUnique({
      where: { userId: req.user.id },
      select: { status: true, createdAt: true, updatedAt: true }
    })
    res.status(200).json({ success: true, request }) // null if never applied
  } catch (error) {
    console.error('Error fetching role request status', error)
    res.status(500).json({ error: 'Failed to fetch status' })
  }
}

// DEMOTE USER (ADMIN → USER)
export const changeUserRole = async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    // 1. Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    // 2. If demoting to USER, reject their RoleRequest (if one exists)
    if (newRole === UserRole.USER) {
      await prisma.roleRequest.updateMany({
        where: {
          userId,
          status: { in: ['APPROVED', 'PENDING'] }, // reject either state
        },
        data: {
          status: 'REJECTED',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${newRole}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Role Change Error:", error);
    res.status(500).json({ error: "Failed to change role" });
  }
};