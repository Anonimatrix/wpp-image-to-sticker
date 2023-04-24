const optionsMessages = [
    "👉 You can use speed=number (example: speed=2) to set the speed of the video.",
    "👉 You can use quality=number (example: quality=10) to set the quality of the video.",
];

export const welcomeMessage = `*Welcome to the WhatsApp Sticker Bot!!!*
    👉 Send me a *image* | *gif* | *video* to convert in sticker.
    ${optionsMessages.join("\n")}
`;

export const invalidFormatMessage = `Invalid format! 
Please send a *image* | *gif* | *video* to convert in sticker.`;
