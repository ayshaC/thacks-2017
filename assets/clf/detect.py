#!/usr/bin/python
# -*- coding: utf-8 -*-

# to train the model
# python detect.py --shape-predictor predict.dat
# python detect.py --shape-predictor predict.dat --alarm alarm.wav

# import the necessary packages

from scipy.spatial import distance as dist
from imutils.video import VideoStream
from imutils import face_utils
from threading import Thread
import numpy as np
import playsound
import argparse
import imutils
import time
import dlib
import cv2


def sound_alarm(path):

    # play an alarm sound

    playsound.playsound(path)


def eye_chin_dist(eye, chin, side):

    # compute euclidean  distance for the eyes

    if side == 'right':
        A = dist.euclidean(eye[5], chin[6])
        B = dist.euclidean(eye[4], chin[7])
    elif side == 'left':
        A = dist.euclidean(eye[5], chin[10])
        B = dist.euclidean(eye[4], chin[11])

    avg_dist = (A + B) * 50.0

    return avg_dist


def eye_aspect_ratio(eye):

    # compute the euclidean distances between the two sets of
    # vertical eye landmarks (x, y)-coordinates

    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])

    # compute the euclidean distance between the horizontal
    # eye landmark (x, y)-coordinates

    C = dist.euclidean(eye[0], eye[3])

    # compute the eye aspect ratio

    aspect_ratio = (A + B) / (2.0 * C)

    # return the eye aspect ratio

    return aspect_ratio


# construct the argument parse and parse the arguments

ap = argparse.ArgumentParser()
ap.add_argument('-p', '--shape-predictor', required=True,
                help='path to facial landmark predictor')
ap.add_argument('-a', '--alarm', type=str, default='',
                help='path alarm .WAV file')
ap.add_argument('-w', '--webcam', type=int, default=0,
                help='index of webcam on system')
args = vars(ap.parse_args())

# define two constants, one for the eye aspect ratio to indicate
# blink and then a second constant for the number of consecutive
# frames the eye must be below the threshold for to set off the
# alarm

EYE_AR_THRESH = 0.3
BLINK_CONSEC_FRAMES = 5
EYE_AR_CONSEC_FRAMES = 20

# initialize the frame counter as well as a boolean used to
# indicate if the alarm is going off

COUNTER = 0
TOTAL = 0
NO_LOOP = 0
ALARM_ON = False

NO_DETECTION = 0
CHIN_DIST_ORIG = 0
ORIG_DIFF = 0
WIDTH = 1200

# initialize dlib's face detector (HOG-based) and then create
# the facial landmark predictor

print '[INFO] loading facial landmark predictor...'
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(args['shape_predictor'])

# grab the indexes of the facial landmarks for the left and
# right eye, respectively

(lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS['left_eye']
(rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS['right_eye']
(nStart, nEnd) = face_utils.FACIAL_LANDMARKS_IDXS['nose']
(jStart, jEnd) = face_utils.FACIAL_LANDMARKS_IDXS['jaw']

# start the video stream thread

print '[INFO] starting video stream thread...'
vs = VideoStream(src=args['webcam']).start()
time.sleep(1.0)
# loop over frames from the video stream

while True:

    # grab the frame from the threaded video file stream, resize
    # it, and convert it to grayscale
    # channels)

    frame = vs.read()
    frame = imutils.resize(frame, width=WIDTH)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    num_frames = 0

    # fps = video.get(cv2.CAP_PROP_FPS)
      #  print "Frames per second using video.get(cv2.CAP_PROP_FPS) : {0}".format(fps)

    # detect faces in the grayscale frame

    rects = detector(gray, 0)

    # loop over the face detections

    for rect in rects:

        # determine the facial landmarks for the face region, then
        # convert the facial landmark (x, y)-coordinates to a NumPy
        # array

        shape = predictor(gray, rect)
        shape = face_utils.shape_to_np(shape)

        # extract the left and right eye coordinates, then use the
        # coordinates to compute the eye aspect ratio for both eyes

        leftEye = shape[lStart:lEnd]
        rightEye = shape[rStart:rEnd]

        nose = shape[nStart:nEnd]

        chin = shape[jStart:jEnd]

        leftEAR = eye_aspect_ratio(leftEye)
        rightEAR = eye_aspect_ratio(rightEye)
        rightChinDist = eye_chin_dist(rightEye, chin, 'right')
        leftChinDist = eye_chin_dist(leftEye, chin, 'left')

        CHIN_DIST_CURR = (rightChinDist + leftChinDist) / 2.0

        if CHIN_DIST_ORIG == 0:
            CHIN_DIST_ORIG == CHIN_DIST_CURR

        diff = CHIN_DIST_CURR - CHIN_DIST_ORIG

        if ORIG_DIFF == 0:
            ORIG_DIFF = diff

        delta = diff - ORIG_DIFF

        # average the eye aspect ratio together for both eyes

        aspect_ratio = (leftEAR + rightEAR) / 2.0

        # print 'Here %s' % aspect_ratio

        # compute the convex hull for the left and right eye, then
        # visualize each of the eyes

        leftEyeHull = cv2.convexHull(leftEye)
        rightEyeHull = cv2.convexHull(rightEye)

        # noseHULL = cv2.convexHull(nose)

        cv2.drawContours(frame, [leftEyeHull], -1, (0, 0xFF, 0), 1)
        cv2.drawContours(frame, [rightEyeHull], -1, (0, 0xFF, 0), 1)

        cv2.drawContours(frame, [nose], -1, (0, 0xFF, 0), 1)

        cv2.drawContours(frame, [chin], -1, (0, 0xFF, 0), 1)

        NO_LOOP = 0

        if COUNTER == 0:
            num_frames += 1

            # print 'No Counter %d' % num_frames

        # check to see if the eye aspect ratio is below the blink
        # threshold, and if so, increment the blink frame counter

        if aspect_ratio < EYE_AR_THRESH:
            COUNTER += 1
            num_frames = 0

            # print 'Counter at %d' % COUNTER

            # if the eyes were closed for a sufficient number of
            # then sound the alarm

            if COUNTER >= EYE_AR_CONSEC_FRAMES:

                # if the alarm is not on, turn it on

                if not ALARM_ON:
                    ALARM_ON = True

                    # check to see if an alarm file was supplied,
                    # and if so, start a thread to have the alarm
                    # sound played in the background
                    #r = requests.post('http://35.183.6.3:443/addEvent',data={'groupid':1, s3key='https://s3.ca-central-1.amazonaws.com/thacks2017/20171022_101827%5B1%5D.mp4'})

                    if args['alarm'] != '':
                        t = Thread(target=sound_alarm,
                                   args=(args['alarm'], ))
                        t.deamon = True
                        t.start()
                    # draw an alarm on the frame

                cv2.putText(
                    frame,
                    'DROWSINESS ALERT!',
                    (20, 60),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.5,
                    (0, 0, 0xFF),
                    2,
                    )
        else:

            # otherwise, the eye aspect ratio is not below the blink
            # threshold, so reset the counter and alarm
            # if the eyes were closed for a sufficient number of
            # then increment the total number of blinks

            if COUNTER >= BLINK_CONSEC_FRAMES:
                TOTAL += 1

            COUNTER = 0
            ALARM_ON = False

        # draw the computed eye aspect ratio on the frame to help
        # with debugging and setting the correct eye aspect ratio
        # thresholds and frame counters

        cv2.putText(
            frame,
            'Ratio: {:.2f}'.format(aspect_ratio),
            (600, 60),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.5,
            (0, 0, 0xFF),
            2,
            )

        cv2.putText(
            frame,
            'Blinks: {}'.format(TOTAL),
            (40, 120),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.5,
            (0, 0, 0xFF),
            2,
            )
        print 'The movement in chin is %d' % delta
        if delta > WIDTH * 2.5:
            #r = requests.post('http://35.183.6.3:443/addEvent',data={'groupid':2, s3key='https://s3.ca-central-1.amazonaws.com/thacks2017/20171022_101827%5B1%5D.mp4'})
            cv2.putText(
                frame,
                'PAY ATTENTION',
                (200, 300),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.5,
                (0, 0, 0xFF),
                2,
                )
            break

    NO_LOOP += 1

    # print 'Nothing Detected %d' % NO_LOOP

    if NO_LOOP > 10:
        #r = requests.post('http://35.183.6.3:443/addEvent',data={'groupid':3, s3key='https://s3.ca-central-1.amazonaws.com/thacks2017/20171022_101827%5B1%5D.mp4'})
        cv2.putText(
            frame,
            'LOOK AHEAD!',
            (300, 300),
            cv2.FONT_HERSHEY_SIMPLEX,
            2.0,
            (0, 0, 0xFF),
            2,
            )

        if not ALARM_ON:
            ALARM_ON = True

                    # check to see if an alarm file was supplied,
                    # and if so, start a thread to have the alarm
                    # sound played in the background

            if args['alarm'] != '':
                t = Thread(target=sound_alarm, args=(args['alarm'], ))
                t.deamon = True
                t.start()

    # show the frame

    cv2.imshow('Frame', frame)
    key = cv2.waitKey(1) & 0xFF

    # if the `q` key was pressed, break from the loop

    if key == ord('q'):
        break

# do a bit of cleanup

cv2.destroyAllWindows()
vs.stop()
