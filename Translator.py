from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
)

def translate_to_language(text, target_language, llm_model, role):

    message = ""
    
    if role == "Other":
        message = f"""
            Please translate the following text to {target_language}. 
            Make sure to preserve the semantics and meaning while keeping as many words the same as possible. 
            Only return the translated text:\n\n{text}
            """
    else:
        message = f"""
            Please translate the following text to {target_language}. 
            Make sure to preserve the semantics and meaning while keeping as many words the same as possible. 
            Use terminology and phrasing appropriate for a {role}. 
            Only return the translated text:\n\n{text}
            """
    
    completion = client.chat.completions.create(
        model=llm_model,
        messages=[
            {
            "role": "user",
            "content": message
            } 
        ]
    )

    response_string = completion.choices[0].message.content

    return response_string

def translate_to_original(translated_text, original_language, llm_model, role):

    message = ""
    
    if role == "Other":
        message = f"""
            Please translate the following text back to {original_language}. 
            Make sure to preserve the semantics and meaning while keeping as many words the same as possible. 
            Only return the translated text:\n\n{translated_text}
            """
    else:
        message = f"""
            Please translate the following text back to {original_language}. 
            Make sure to preserve the semantics and meaning while keeping as many words the same as possible. 
            Use terminology and phrasing appropriate for a {role}. 
            Only return the translated text:\n\n{translated_text}
            """
    
    completion = client.chat.completions.create(
        model=llm_model,
        messages=[
            {
            "role": "user",
            "content": message
            } 
        ]
    )

    response_string = completion.choices[0].message.content

    return response_string