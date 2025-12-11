import { Request, Response, NextFunction } from 'express';
interface ArticleListItem {
    id: string;
    title: string;
    preview: string;
    createdAt: string;
    isImportant: boolean;
}
export declare function getArticles(req: Request, res: Response<ArticleListItem[]>, next: NextFunction): Promise<void>;
export declare function getArticleById(req: Request<{
    id: string;
}>, res: Response, next: NextFunction): Promise<void>;
export {};
//# sourceMappingURL=articleController.d.ts.map