import { Telegraf, Markup } from "telegraf";
import express from "express";

const bot = new Telegraf("7699005018:AAFgqMKxublJdOl7RVjGaEA6uvkmhKN6RTc");
let groupId = null;

bot.start((ctx) => {
  groupId = ctx.chat.id;
  ctx.reply("Group/Channel ID saved: " + groupId);
});

bot.on("left_chat_member", async (ctx) => {
  const user = ctx.message.left_chat_member;
  if (!groupId) return;
  try {
    await bot.telegram.sendMessage(
      user.id,
      "You left the group. Please rejoin:",
      Markup.inlineKeyboard([
        [Markup.button.url("Join Group", "https://t.me/" + (await bot.telegram.getChat(groupId)).username)]
      ])
    );
    setTimeout(async () => {
      const member = await bot.telegram.getChatMember(groupId, user.id);
      if (["left", "kicked"].includes(member.status)) {
        await bot.telegram.banChatMember(groupId, user.id);
      }
    }, 60000);
  } catch (e) {}
});

const app = express();
app.use(express.json());
app.use(bot.webhookCallback("/"));

app.get("/", (req, res) => res.send("Bot is running via Webhook!"));

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
