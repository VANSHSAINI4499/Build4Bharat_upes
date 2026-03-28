import numpy as np

def get_angle(a, b, c):
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    #subtracting angle between ab and x-axis from angle between bc and x-axis 
    #this gives us the angle between ab and bc i.e. the folding point of finger
    angle=np.abs(np.degrees(radians))
    return angle

def get_distance(landmark_list):
    if len(landmark_list)<2:   #iff there are 2 landmarks bc we need two landmarks to calculate distance 
        return
    
    (x1, y1), (x2, y2) = landmark_list[0], landmark_list[1]
    L = np.hypot(x2-x1, y2-y1)
#we're taking x&y coordinates of the two landmarks and calculating the euclidean dist. using hypotenuse function
    return np.interp(L, [0,1], [0,1000])
#interpolating the distance values between 0 & 1 to values in whole numbers for easier calculation