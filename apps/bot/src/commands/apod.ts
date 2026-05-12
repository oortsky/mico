import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { fetch, FetchResultTypes } from "@sapphire/fetch";

import {
  MessageFlags,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from "discord.js";

import { errorMessage } from "../utils/messages";

interface NASAResponse {
  copyright?: string;
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: "image" | "video";
  service_version: string;
  thumbnail_url?: string;
  title: string;
  url: string;
}

@ApplyOptions<Command.Options>({
  description: "☄️ Send the astronomy picture of the day."
})
export class ApodCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(builder =>
      builder.setName(this.name).setDescription(this.description)
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const NASA_ENDPOINT = "https://api.nasa.gov/";
    const key = process.env.NASA_API_KEY;

    await interaction.deferReply();

    try {
      const data = await fetch<NASAResponse>(
        `${NASA_ENDPOINT}planetary/apod?thumbs=true&api_key=${key}`,
        FetchResultTypes.JSON
      );

      const {
        copyright,
        date,
        explanation,
        hdurl,
        media_type,
        thumbnail_url,
        title,
        url
      } = data;

      const readableDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      const image = media_type === "video" ? thumbnail_url : hdurl || url;

      const section = new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            [
              "# ☄️ Astronomy Picture of the Day",
              `## ${title}`,
              "",
              `### 📅 Date`,
              readableDate,
              "",
              `### 📝 Explanation`,
              explanation.length > 1000
                ? `${explanation.slice(0, 1000)}...`
                : explanation,
              "",
              `### 👨‍🚀 Copyright`,
              copyright || "Unknown"
            ].join("\n")
          )
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(image!));

      const buttons = [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(media_type === "video" ? "Watch Video" : "Open HD Image")
            .setStyle(ButtonStyle.Link)
            .setURL(hdurl || url)
        )
      ];

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          section,
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large),
          new TextDisplayBuilder().setContent(
            [
              `-# Powered by NASA APOD API`,
              `-# Service Version: ${data.service_version}`
            ].join("\n")
          ),
          ...buttons
        ]
      });
    } catch (error) {
      this.container.logger.error(error);

      await interaction.editReply({
        content: errorMessage("fetch the Astronomy Picture of the Day")
      });
    }
  }
}
