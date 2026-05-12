import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { fetch, FetchResultTypes } from "@sapphire/fetch";

import {
  MessageFlags,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize
} from "discord.js";

import { errorMessage } from "../utils/messages";

interface BMKGResponse {
  Infogempa: {
    gempa: {
      Jam: string;
      Magnitude: string;
      Tanggal: string;
      Wilayah: string;
      Potensi: string;
      Kedalaman: string;
      Shakemap: string;
    };
  };
}

@ApplyOptions<Command.Options>({
  description: "⛰️ Send the latest earthquake report."
})
export class QuakeCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(builder =>
      builder.setName(this.name).setDescription(this.description)
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const BMKG_ENDPOINT = "https://data.bmkg.go.id/DataMKG/TEWS/";

    await interaction.deferReply();

    try {
      const data = await fetch<BMKGResponse>(
        `${BMKG_ENDPOINT}autogempa.json`,
        FetchResultTypes.JSON
      );

      const { Jam, Magnitude, Tanggal, Wilayah, Potensi, Kedalaman, Shakemap } =
        data.Infogempa.gempa;

      const shakemapImage = `${BMKG_ENDPOINT}${Shakemap}`;

      const section = new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            [
              "# ⛰️ Earthquake Alert",
              `### 🌍 Region`,
              `${Wilayah}`,
              "",
              `### 📊 Information`,
              `- **Magnitude:** ${Magnitude} SR`,
              `- **Depth:** ${Kedalaman}`,
              `- **Time:** ${Tanggal} | ${Jam}`,
              `- **Potency:** ${Potensi}`
            ].join("\n")
          )
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(shakemapImage));

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          section,
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large),
          new TextDisplayBuilder().setContent("-# Powered by BMKG Indonesia")
        ]
      });
    } catch (error) {
      this.container.logger.error(error);

      await interaction.editReply({
        content: errorMessage("fetch the earthquake data")
      });
    }
  }
}
