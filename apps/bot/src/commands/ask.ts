import { Args, Command } from "@sapphire/framework";
import type { Message } from "discord.js";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";

import { emptyQuestionMessage, errorMessage } from "../utils/messages";
import { truncate } from "../utils/truncate";

export class AskCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "ask",
      aliases: ["tanya", "nanya", "question"],
      description: "👾 Ask something to the bot."
    });
  }

  public override async messageRun(message: Message, args: Args) {
    const prompt = await args.rest("string").catch(() => "");

    const attachments = [...message.attachments.values()];

    if (!prompt && attachments.length === 0) {
      return message.reply({
        content: emptyQuestionMessage()
      });
    }

    try {
      const content: Array<any> = [];

      if (prompt) {
        content.push({
          type: "text",
          text: prompt
        });
      }

      for (const attachment of attachments) {
        if (!attachment.contentType) continue;

        content.push({
          type: "file",
          data: attachment.url,
          mediaType: attachment.contentType
        });
      }

      const { text } = await generateText({
        model: google("gemini-3.1-flash-lite"),
        system:
          "You are an AI Assistant named Mico, You're a simple, minimal, yet cheerful person. So, you love to respond to messages in a straight-to-the-point and short but comprehensive, yet friendly way, as you include emojis in every message. You are also a critical thinker, creative, and problem-solver.",
        messages: [
          {
            role: "user",
            content
          }
        ]
      });

      return message.reply({
        content: truncate(text)
      });
    } catch (error) {
      this.container.logger.error(error);

      return message.reply({
        content: errorMessage("generate an answer")
      });
    }
  }
}
