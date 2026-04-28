import { prisma } from '../lib/db.js';

export const getSubmissions = async (req, res) => {
  const { problemId } = req.params;
  const userId = req.user.id;

  try {
    const submissions = await prisma.submission.findMany({
      where: { userId, problemId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        language: true,
        status: true,
        passedCount: true,
        totalCount: true,
        runtime: true,
        memory: true,
        createdAt: true,
        // omit source_code for list view — keep it light
      },
    });

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

export const getSubmission = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const submission = await prisma.submission.findUnique({ where: { id } });

    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    // users can only see their own
    if (submission.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    res.status(200).json({ success: true, submission });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
};