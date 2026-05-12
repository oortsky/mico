import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";

@ApplyOptions<Command.Options>({
  description: "🏓 Check bot latency."
})
export class PingCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(builder =>
      builder.setName(this.name).setDescription(this.description)
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    await interaction.deferReply();

    const roundTrip = Date.now() - interaction.createdTimestamp;

    const heartbeat = Math.round(this.container.client.ws.ping);

    return interaction.editReply({
      content: [
        "### 🏓 Pong!",
        `- Round Trip: \`${roundTrip}ms\``,
        `- Heartbeat: \`${heartbeat}ms\``
      ].join("\n")
    });
  }
}
