import { handleCreateApiKey, handleDeleteApiKey, renderApiKeyList } from '@/modules/apikey/apikey.controller';
import { Router } from 'express';

const router = Router();

router.get("/", renderApiKeyList);
router.post("/create", handleCreateApiKey);
router.post("/delete", handleDeleteApiKey);

export { router as apiKeyRouter };
