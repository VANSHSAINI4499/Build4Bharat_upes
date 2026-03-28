import cv2
import mediapipe as mp #mediapipe library has hands module which allows us to detect all the endpoints and landmarks of hand and the hand gestures
import pyautogui
import util
import random
from pynput.mouse import Button, Controller
mouse = Controller()

screen_width, screen_height = pyautogui.size()
mouse = Controller()

mpHands=mp.solutions.hands
hands=mpHands.Hands(
    static_image_mode=False, #false bc we r capturing video
    model_complexity=1,  #for better model
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7, #only if at least 70% confident of a hand detected, track it
    max_num_hands=1 #max 1 hand to detect for control
)

def find_finger_tip(processed):
    if processed.multi_hand_landmarks:
        hand_landmarks = processed.multi_hand_landmarks[0]
        return hand_landmarks.landmark[mpHands.HandLandmark.INDEX_FINGER_TIP]
    
    return None

def move_mouse(index_finger_tip):
    if index_finger_tip is not None:
        x = int(index_finger_tip.x * screen_width)  #to get the actual x and y positions of index finger
        y = int(index_finger_tip.y * screen_height) #relative to the screen width and height respectively
        pyautogui.moveTo(x,y)
        
def is_left_click(landmarks_list, thumb_index_dist):
    return (util.get_angle(landmarks_list[5], landmarks_list[6], landmarks_list[8])<50 and
            util.get_angle(landmarks_list[9], landmarks_list[10], landmarks_list[12])>90 and
            thumb_index_dist>50
            )
    
def is_right_click(landmarks_list, thumb_index_dist):
    return (util.get_angle(landmarks_list[9], landmarks_list[10], landmarks_list[12])<50 and
            util.get_angle(landmarks_list[5], landmarks_list[6], landmarks_list[8])>90 and
            thumb_index_dist>50
            )
    
def is_double_click(landmarks_list, thumb_index_dist):
    return (util.get_angle(landmarks_list[5], landmarks_list[6], landmarks_list[8])<50 and
            util.get_angle(landmarks_list[9], landmarks_list[10], landmarks_list[12])<50 and
            thumb_index_dist>50
            )
    
def is_screenshot(landmarks_list, thumb_index_dist):
    return (util.get_angle(landmarks_list[5], landmarks_list[6], landmarks_list[8])<50 and
            util.get_angle(landmarks_list[9], landmarks_list[10], landmarks_list[12])<50 and
            thumb_index_dist<50 
            )

def detect_gestures(frame, landmarks_list, processed):
    if len(landmarks_list)>=21: #there are 21 landmarks and we need to detect all of them to continue
        
        index_finger_tip = find_finger_tip(processed)
        thumb_index_dist = util.get_distance([landmarks_list[4], landmarks_list[5]])
        #dist btwn landmark 4 on thumb and landmark 5 on index finger
        
        if thumb_index_dist<50 and util.get_angle(landmarks_list[5], landmarks_list[6], landmarks_list[8])>90:
            move_mouse(index_finger_tip) 
            
        #LEFT CLICK
        elif is_left_click(landmarks_list, thumb_index_dist):
            mouse.press(Button.left)
            mouse.release(Button.left)
            cv2.putText(frame, "Left Click", (50,50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
            
        #RIGHT CLICK
        elif is_right_click(landmarks_list, thumb_index_dist):
            mouse.press(Button.right)
            mouse.release(Button.right)
            cv2.putText(frame, "Right Click", (50,50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)
            
        #DOUBLE CLICK
        elif is_right_click(landmarks_list, thumb_index_dist): 
            pyautogui.doubleClick()
            cv2.putText(frame, "Double Click", (50,50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,0), 2)
              
            
        #SCREENSHOT
        elif is_screenshot(landmarks_list, thumb_index_dist):
            im1 = pyautogui.screenshot()
            label = random.randint(1,1000)
            im1.save(f'my_screenshot_{label}.png')
            cv2.putText(frame, "Screenshot Taken", (50,50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,0), 2)
        

def main():
    cap = cv2.VideoCapture(0)
    draw = mp.solutions.drawing_utils #helps in drawing the landmarks
    
    try:
        while cap.isOpened():
            ret,frame = cap.read()
            
            if not ret:
                break
            frame=cv2.flip(frame,1)
            frameRGB=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) #mediapipe requires frames to be passed in RGB format while openCV by default captures in BGR
            processed = hands.process(frameRGB) #will process all the frames and detecyt all teh landmarks
            
            landmarks_list = []   #array to receive all the landmarks from the processed frames
            
            if processed.multi_hand_landmarks:  #if multiple hands detected
                hand_landmarks = processed.multi_hand_landmarks[0] #take landmarks from one of the hands
                draw.draw_landmarks(frame, hand_landmarks, mpHands.HAND_CONNECTIONS)
                
                for lm in hand_landmarks.landmark: 
                    landmarks_list.append((lm.x, lm.y)) #taking all x & y coordinates of individual landmarks and pushing it to the list
                 
            detect_gestures(frame, landmarks_list, processed)   
                    
            cv2.imshow('Frame',frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):  #just wait for 1 ms after each frame is ret & if the keyboard input in this wait period is q then break
                break
            
    finally:
        cap.release()  #after being done we need to release all the captures and destroy all the windows that opencv had created 
        cv2.destroyAllWindows()
        
if __name__=='__main__':   #to ensure that if you're importing this file to any other python files, this function won't work
    main()
        
            
            