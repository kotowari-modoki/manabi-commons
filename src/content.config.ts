// ABOUTME: Defines the docs collection schema used by the Manabi Commons site.
// ABOUTME: Keeps educational review metadata optional for new and substantially revised lessons.
import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				learning_context: z
					.object({
						grade: z.string().optional(),
						subject: z.string().optional(),
						unit: z.string().optional(),
						curriculum_ref: z.string().optional(),
						prerequisite: z.union([z.string(), z.array(z.string())]).optional(),
					})
					.optional(),
				review: z
					.object({
						source_ref: z.union([z.string(), z.array(z.string())]).optional(),
						ai_process: z
							.array(
								z.enum([
									'structure',
									'rewrite',
									'fact_check',
									'summarize',
									'translate',
									'classify',
									'extract',
									'compare',
									'synthesize',
									'critique',
								]),
							)
							.optional(),
						confidence: z.enum(['low', 'medium', 'high']).optional(),
						human_review: z.enum(['required', 'completed']).optional(),
						safety_review: z.enum(['required', 'completed']).optional(),
						age_level_review: z.enum(['required', 'completed']).optional(),
					})
					.optional(),
				content_status: z
					.object({
						claim_status: z
							.enum(['tentative', 'reviewed', 'needs_revision'])
							.optional(),
						related_pages: z.array(z.string()).optional(),
						update_note: z.string().optional(),
					})
					.optional(),
			}),
		}),
	}),
};
