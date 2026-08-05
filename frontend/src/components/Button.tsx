function Button() {
    return (
        <>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => alert('Button clicked!')}>
                Click me! This is a simple button to demonstrate Component 
            </button>
        </>
    )
}

export default Button