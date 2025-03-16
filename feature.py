# import sys
# def main():
#     print("Hello from Python feature task!")
# if __name__ == "__main__":
#     main()
# worked!

# import sys
# # Example with user input
# user_input = sys.argv[1] if len(sys.argv) > 1 else "Default"
# print(f"Hello, {user_input}! Python task completed.")
# worked! Now want to process the input

# import sys
# # Get user input from Node.js
# # user_input = sys.argv[1] if len(sys.argv) > 1 else "Default"
# # print(f"Hello, {user_input}! Python task completed.")
# user_input = sys.argv[1] if len(sys.argv) > 1 else "Default"
# try:
#     user_input = int(user_input)
#     print(f"Integer input: {user_input}")
# except ValueError:
#     print(f"String input: {user_input}")
# works. But takes input as string. Let's try with giving an int as input and output an int.

# import sys
# from textblob import TextBlob

# def get_rating(review):
#     polarity = TextBlob(review).sentiment.polarity
#     # Normalize polarity (-1 to 1) to (1 to 5)
#     rating = round(3 * (polarity + 1) + 1)
#     return max(1, min(5, rating))  # Ensure rating is between 1 and 5

# if __name__ == "__main__":
#     user_review = sys.argv[1] if len(sys.argv) > 1 else "Default review"
#     print(get_rating(user_review))

from textblob import TextBlob
import sys

# def get_rating(review):
#     analysis = TextBlob(review)
#     # rating = int((analysis.sentiment.polarity + 1) * 2)  # scale to [0, 2]
#     # rating += 1  # scale to [1, 5]
#     rating = round((analysis.sentiment.polarity + 1) * 2.5)  # round instead of truncating
#     rating = max(1, min(5, rating))  # Ensure the rating stays between 1 and 5
#     print(f"Polarity score for the review: {analysis.sentiment.polarity}")
#     return rating

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

# def get_rating(review):
#     analysis = TextBlob(review)
#     # Normalize the polarity score from [-1, 1] to [1, 5]
#     rating = int((analysis.sentiment.polarity + 1) * 2)  # scale to [0, 2]
#     rating += 1  # scale to [1, 5]
#     return rating