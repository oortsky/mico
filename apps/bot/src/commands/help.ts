import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

@ApplyOptions<Command.Options>({
  description: "📚 Show all available commands."
})
export class HelpCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(builder =>
      builder.setName(this.name).setDescription(this.description)
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const container = new ContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              [
                "# 🤖 Mico Help Center",
                "",
                "Modern utility & AI-powered Discord bot.",
                "",
                "## 📌 Slash Commands",
                "",
                "`/ping`",
                "Check bot latency and API response time.",
                "",
                "`/quake`",
                "Send latest earthquake information.",
                "",
                "`/apod`",
                "Send NASA Astronomy Picture of the Day.",
                "",
                "## 🧠 AI Chat",
                "",
                "`@Mico ask <message>`",
                "Chat with AI directly by mentioning the bot.",
                "",
                "### Supported Features",
                "- Text conversation",
                "- Image input",
                "- File attachments",
                "",
                "### Limitations",
                "- No internet search",
                "- No realtime browsing",
                "",
                "Built for speed, simplicity, and utility."
              ].join("\n")
            )
          )
          .setButtonAccessory(
            new ButtonBuilder()
              .setLabel("Invite Mico")
              .setStyle(ButtonStyle.Link)
              .setURL(
                "https://discord.com/oauth2/authorize?client_id=1230073861580783647"
              )
          )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Developed by OORTSKY.")
      );

    return interaction.reply({
      flags: ["IsComponentsV2"],
      components: [container]
    });
  }
}
