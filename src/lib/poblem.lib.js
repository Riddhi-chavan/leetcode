import axios from "axios";

export function getLanguageId(Language) {
    const languageMap = {
        PYTHON: 71,
        JAVASCRIPT: 63,
        JAVA: 62,
    }

    return languageMap[Language.toUpperCase()];

}


export async function submitBatch(submissions) {
    const { data } = await axios.post(
        "https://judge029.p.rapidapi.com/submissions/batch",
        {
            params: {
                base64_encoded: "true",
            },

            headers: {
                "x-rapidapi-key": "300499526dmshc44a845ccf0661bp1597d4jsn4c37baefe350",
                "x-rapidapi-host": "judge029.p.rapidapi.com",
                "Content-Type": "application/json",

                data: {
                    submissions: submissions,

                },
            }
        }
    )  
    
    return data
}