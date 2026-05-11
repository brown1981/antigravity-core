import random
import datetime
import json

def get_daily_compass():
    """
    日々の運用におけるマインドセットと指針を提供します。
    (Daily Compass の移植版)
    """
    disciplines = [
        "Discipline is the bridge between goals and accomplishment.",
        "The goal is not to be right, but to make money.",
        "In trading, everything you want is on the other side of fear.",
        "Market is a device for transferring money from the impatient to the patient.",
        "Risk comes from not knowing what you're doing.",
        "The most important organ in investing is the stomach, not the brain."
    ]
    
    now = datetime.datetime.now()
    date_str = now.strftime("%A, %B %d, %Y")
    
    results = {
        'date': date_str,
        'discipline': random.choice(disciplines),
        'focus_of_the_day': "Capital Preservation" if now.weekday() < 5 else "Strategic Review"
    }

    return json.dumps(results, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    import json
    print(get_daily_compass())
