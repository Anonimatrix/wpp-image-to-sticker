export const regexOption = /(\w+)=([\w.]+)/g;

const minSize = "min(iw, ih)";
export const cropQuery = `crop='${minSize}':'${minSize}':'if(gte(ih, iw), 0, iw / 2 - ${minSize} / 2)':'if(gte(iw, ih), 0,  ih / 2 - ${minSize} / 2)'`;

export const optionsVideoQueries: { [key: string]: (value: string) => string } =
    {
        speed: (value: string) => `setpts=PTS/${value}`,
    };

export const optionsOutputQueries: {
    [key: string]: (value: string) => string;
} = {
    // "240p": () => `-vf scale=426:240`,
    quality: (value: string) => {
        if (Number(value) < 0 || Number(value) > 100 || isNaN(Number(value))) {
            value = String(7);
        }

        return `-q:v ${value}`;
    },
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
