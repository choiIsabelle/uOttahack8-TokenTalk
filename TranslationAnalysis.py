
from difflib import SequenceMatcher
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer, util


def lexical_similarity(originalText, translatedText):
    """
    Calculate the lexical similarity between two texts using SequenceMatcher.

    Args:
        originalText (str): The first text.
        translatedText (str): The second text.

    Returns:
        float: A similarity ratio between 0 and 1.
    """
    return SequenceMatcher(None, originalText, translatedText).ratio()

def vector_space_similarity(originalText, translatedText):
    """
    Calculate the vector space similarity between two texts using TF-IDF and cosine similarity.

    Args:
        originalText (str): The first text.
        translatedText (str): The second text.
    Returns:
        float: A cosine similarity score between 0 and 1.
    """
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([originalText, translatedText])
    cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    return cosine_sim[0][0]

def semantic_similarity(originalText, translatedText, model_name='all-MiniLM-L6-v2'):
    """
    Calculate the semantic similarity between two texts using Sentence Transformers.

    Args:
        originalText (str): The first text.
        translatedText (str): The second text.
        model_name (str): The name of the pre-trained model to use.

    Returns:
        float: A cosine similarity score between 0 and 1.
    """
    model = SentenceTransformer(model_name)
    embeddings1 = model.encode(originalText, convert_to_tensor=True)
    embeddings2 = model.encode(translatedText, convert_to_tensor=True)
    cosine_sim = util.pytorch_cos_sim(embeddings1, embeddings2)
    return cosine_sim.item()