import { useState } from "react"

function App() {

    const [password, setPassword] = useState("")
    const [inputText, setInputText] = useState("");

    function getOutputText() {

        console.log("password:", password);

        // TODO : Use ReactQuery cuz should be async for calculating hash and encrypting

        return inputText;
    }

    return (
        <div className="h-dvh flex flex-col justify-center items-center gap-4 p-4 w-full max-w-screen-sm">
            <h1 className="font-bold text-2xl sm:text-3xl text-white">Mini Text Encryptor</h1>

            <div className="flex gap-2">
                <p className="text-white">Password:</p>
                <input type="password" className="rounded-md px-2" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div className="w-full flex-grow flex flex-col gap-2">
                <h2 className="text-white font-bold">Raw Text:</h2>
                <textarea
                    className="rounded-md w-full flex-grow p-2 resize-none"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                />
            </div>

            <div className="w-full flex-grow flex flex-col gap-2">
                <h2 className="text-white font-bold">Encrypted Text:</h2>
                <textarea
                    className="rounded-md w-full flex-grow p-2 resize-none"
                    value={getOutputText()}
                />
            </div>
        </div>
    )
}

export default App
