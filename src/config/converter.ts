export const regexOption = /(\w+)=([\w.]+)/g;

const minSize = "min(iw, ih)";
export const cropQuery = `crop='${minSize}':'${minSize}':'if(gte(ih, iw), 0, iw / 2 - ${minSize} / 2)':'if(gte(iw, ih), 0,  ih / 2 - ${minSize} / 2)'`;

export const optionsVideoQueries: { [key: string]: (value: string) => string } =
    {
        speed: (value: string) => `setpts=${value}*PTS`,
    };

export const optionsOutputQueries: {
    [key: string]: (value: string) => string;
} = {
    // "240p": () => `-vf scale=426:240`,
};

export const outputOptions = [
    "-loop 0",
    "-lossless 0",
    "-preset icon",
    "-compression_level 12",
    "-q:v 7",
    "-an",
    "-vsync 1",
    "-fs 450k",
];
