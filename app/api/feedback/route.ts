import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, description, email, errorInfo, userAgent, url } = body;

    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("SLACK_WEBHOOK_URL is not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Emoji based on type
    const emojiMap = {
      bug: "🐛",
      suggestion: "💡",
      question: "❓",
    };

    const colorMap = {
      bug: "#ef4444",
      suggestion: "#eab308",
      question: "#3b82f6",
    };

    // Build Slack message
    const slackMessage = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${emojiMap[type as keyof typeof emojiMap] || "📝"} Nouveau feedback - LOCAMEX BETA`,
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Type:*\n${type === "bug" ? "🐛 Bug / Erreur" : type === "suggestion" ? "💡 Suggestion" : "❓ Question"}`,
            },
            {
              type: "mrkdwn",
              text: `*Date:*\n${new Date().toLocaleString("fr-FR", {
                dateStyle: "short",
                timeStyle: "short",
              })}`,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*📝 Description:*\n${description}`,
          },
        },
      ],
    };

    // Add email if provided
    if (email) {
      slackMessage.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*✉️ Email:*\n${email}`,
        },
      } as any);
    }

    // Add error info if present
    if (errorInfo) {
      slackMessage.blocks.push(
        {
          type: "divider",
        } as any,
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*🔴 Erreur technique détectée:*\n\`\`\`${errorInfo.message}\`\`\``,
          },
        } as any
      );

      if (errorInfo.stack) {
        slackMessage.blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Stack trace:*\n\`\`\`${errorInfo.stack.slice(0, 500)}...\`\`\``,
          },
        } as any);
      }
    }

    // Add system info
    slackMessage.blocks.push(
      {
        type: "divider",
      } as any,
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🌐 *URL:* ${url}`,
          },
        ],
      } as any,
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `💻 *User Agent:* ${userAgent}`,
          },
        ],
      } as any
    );

    // Send to Slack
    const slackResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackMessage),
    });

    if (!slackResponse.ok) {
      console.error("Failed to send to Slack:", await slackResponse.text());
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in feedback API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
