import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { ChatDto } from './dto/chat.dto';
import { buildSnapshot } from './prompt/snapshot.builder';
import { systemPrompt } from './prompt/system-prompt';

@Injectable()
export class AinoService {
  private readonly logger = new Logger(AinoService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    this.modelName = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
  }

  async chat(tenantId: string, dto: ChatDto) {
    const lang = dto.lang ?? 'de';
    const snapshot = await buildSnapshot(this.prisma, tenantId);
    const system = systemPrompt(lang, snapshot);

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: system,
      });

      // نحوّل رسائل المحادثة لصيغة Gemini (user/model)
      const contents = dto.messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const result = await model.generateContent({ contents });
      const text = (result.response.text() ?? '').trim();
      return this.parse(text, lang);
    } catch (err) {
      this.logger.error('Aino request failed', err as any);
      return {
        reply: lang === 'de'
          ? 'Entschuldigung - die Antwort konnte nicht geladen werden.'
          : 'Sorry - the response could not be loaded.',
        actions: [],
      };
    }
  }

  private parse(text: string, lang: 'de' | 'en') {
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch { /* ignore */ }
      }
    }
    const reply =
      parsed && typeof parsed.reply === 'string'
        ? parsed.reply
        : text || (lang === 'de' ? 'Keine Antwort.' : 'No answer.');
    const actions = parsed && Array.isArray(parsed.actions)
      ? parsed.actions.filter((a: any) => a && a.type && a.label)
      : [];
    return { reply, actions };
  }
}