// Article controller
import { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';

interface ArticleListItem {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  isImportant: boolean;
}

interface ArticleDetail {
  id: string;
  title: string;
  preview: string;
  content: string;
  createdAt: string;
  isImportant: boolean;
  authorId: string;
}

export const getArticles: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId!; // Middleware ensures this exists

    // Fetch articles for this user, sorted by createdAt descending
    const articles = await prisma.article.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        preview: true,
        createdAt: true,
        isImportant: true,
      },
    });

    // Convert Date to ISO string
    const formattedArticles: ArticleListItem[] = articles.map((article) => ({
      id: article.id,
      title: article.title,
      preview: article.preview,
      createdAt: article.createdAt.toISOString(),
      isImportant: article.isImportant,
    }));

    res.json(formattedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    next(error);
  }
};

export const getArticleById: RequestHandler = async (req, res, next) => {
  try {
    // Get userId from header (middleware should have set it, but double-check)
    const userId = req.userId || (req.headers['x-user-id'] as string);

    if (!userId) {
      res.status(400).json({ error: 'Missing x-user-id' });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Article ID is required' });
      return;
    }

    // Load article by id
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        preview: true,
        content: true,
        createdAt: true,
        isImportant: true,
        authorId: true,
      },
    });

    // Verify article exists and belongs to user
    if (!article || article.authorId !== userId) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Return plain JSON object (not wrapped)
    const articleResponse: ArticleDetail = {
      id: article.id,
      title: article.title,
      preview: article.preview,
      content: article.content,
      createdAt: article.createdAt.toISOString(),
      isImportant: article.isImportant,
      authorId: article.authorId,
    };

    res.json(articleResponse);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
