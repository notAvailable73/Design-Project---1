from textblob import TextBlob
import sys

def get_rating(review):
    analysis = TextBlob(review)
    polarity = analysis.sentiment.polarity
    polarity += 1  # Shift the range from [-1, 1] to [0, 2]
    
    if polarity <= 0.4:  # -1.0 to -0.6 originally
        rating=1
    elif polarity <= 0.8:  # -0.6 to -0.2 originally
        rating=2
    elif polarity <= 1.2:  # -0.2 to 0.2 originally
        rating=3
    elif polarity <= 1.6:  # 0.2 to 0.6 originally
        rating=4
    else:  # > 0.6 originally
        rating=5
    
    print(f"{polarity:.3f}")
    return rating

if __name__ == "__main__":
    # Ensure user passes a review argument
    if len(sys.argv) > 1:
        review_text = sys.argv[1]
        rating = get_rating(review_text)
        print(rating)  # Output rating directly for capture by exec/spawn
    else:
        print("Error: No review provided.")
