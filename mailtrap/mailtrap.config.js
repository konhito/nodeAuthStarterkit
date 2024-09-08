import { MailtrapClient } from "mailtrap";

export const mailtrap = async (userMail, verificatioCode) => {
  const TOKEN = "d825b7a914abb44295c3abe1792669e5";

  const client = new MailtrapClient({
    token: TOKEN,
  });

  const sender = {
    email: "mailtrap@demomailtrap.com",
    name: "Mailtrap Test",
  };
  const recipients = [
    {
      email: userMail,
    },
  ];

  client
    .send({
      from: sender,
      to: recipients,
      subject: "You are awesome!",
      text: "Congrats for sending test email with Mailtrap!" + verificatioCode,
      category: "Integration Test",
    })
    .then(console.log, console.error);
};
