import axios from "axios";

export function getLanguageId(Language) {
    const languageMap = {
        PYTHON: 71,
        JAVASCRIPT: 63,
        JAVA: 62,
    }

    return languageMap[Language.toUpperCase()];

}


const headers = {
    "x-rapidapi-key": "300499526dmshc44a845ccf0661bp1597d4jsn4c37baefe350",
    "x-rapidapi-host": "judge029.p.rapidapi.com",
    "Content-Type": "application/json",
}


export async function submitBatch(submissions) {
    const { data } = await axios.post(
        "https://judge029.p.rapidapi.com/submissions/batch",
        {
           submissions : submissions
        },
        {
            params : {
                base64_encoded : false
            },
            headers : headers
        }
    )

    return data
}


export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))


export async function pollBatchResults(tokens) {
    while (true) {
        const { data } = await axios.get(
            "https://judge029.p.rapidapi.com/submissions/batch",
            {
            params : {
                tokens :  tokens.join(","),
                base64_encoded : false,
                fields : "*"
            },
            headers : headers
        }    
        )
        const results = data.submissions;

        const isAllDone = results.every(
            (r) => r.status.id !== 1 && r.status.id !== 2
        )

        if (isAllDone) return results
        await sleep(1000)
    }
}

