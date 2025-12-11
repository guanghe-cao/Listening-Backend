// Import articles from JSON file into database
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ArticleInput {
  title: string;
  preview: string;
  content: string;
  authorUsername: string;
  isImportant?: boolean;
  createdAt?: string;
}

async function importArticles() {
  try {
    console.log('📚 Starting article import...');
    console.log(`📁 Database URL: ${process.env.DATABASE_URL || 'Not set'}`);

    // Read and parse JSON file
    const jsonPath = path.join(process.cwd(), 'data', 'articles.json');
    console.log(`📖 Reading articles from: ${jsonPath}`);

    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ Error: File not found at ${jsonPath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    const articles: ArticleInput[] = JSON.parse(fileContent);

    console.log(`📄 Found ${articles.length} articles in JSON file\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each article
    for (let i = 0; i < articles.length; i++) {
      const articleData = articles[i];
      console.log(`[${i + 1}/${articles.length}] Processing: "${articleData.title}"`);

      try {
        // Find user by username
        const user = await prisma.user.findUnique({
          where: { username: articleData.authorUsername },
        });

        if (!user) {
          console.warn(`  ⚠️  Warning: User "${articleData.authorUsername}" not found. Skipping article.`);
          skipCount++;
          continue;
        }

        // Check if article with same title already exists
        const existingArticle = await prisma.article.findFirst({
          where: {
            title: articleData.title,
            authorId: user.id,
          },
        });

        // Prepare article data
        const articlePayload = {
          title: articleData.title,
          preview: articleData.preview,
          content: articleData.content,
          isImportant: articleData.isImportant ?? false,
          authorId: user.id,
          createdAt: articleData.createdAt ? new Date(articleData.createdAt) : new Date(),
        };

        if (existingArticle) {
          // Update existing article
          await prisma.article.update({
            where: { id: existingArticle.id },
            data: articlePayload,
          });
          console.log(`  ✅ Updated existing article (ID: ${existingArticle.id})`);
        } else {
          // Create new article
          const newArticle = await prisma.article.create({
            data: articlePayload,
          });
          console.log(`  ✅ Created new article (ID: ${newArticle.id})`);
        }

        successCount++;
      } catch (error) {
        console.error(`  ❌ Error processing article:`, error);
        errorCount++;
      }
    }

    // Summary
    console.log('\n📊 Import Summary:');
    console.log(`  ✅ Successfully imported/updated: ${successCount}`);
    console.log(`  ⚠️  Skipped (user not found): ${skipCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log(`  📝 Total processed: ${articles.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Article import completed successfully!');
    }
  } catch (error) {
    console.error('❌ Fatal error during import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importArticles();

