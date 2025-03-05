import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Flame, ArrowLeft, Play, Pause, RotateCcw, Clock, ChevronRight, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useWorkouts } from '@/context/WorkoutContext';
import { useAuth } from '@/context/AuthContext';
import WorkoutLogForm from '@/components/WorkoutLogForm';

// Mock data for workout programs
const workoutPrograms = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Simple full-body workouts (3 days/week)',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    workouts: [
      {
        id: 'beginner-1',
        name: 'Full Body Workout A',
        exercises: [
          { name: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: 60, description: 'Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then return to standing position.', gifUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80', difficulty: 'Beginner' },
          { name: 'Push-ups', sets: 3, reps: '8-12', rest: 60, description: 'Start in a plank position with hands slightly wider than shoulders, lower your body until chest nearly touches the floor, then push back up.', gifUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80', difficulty: 'Beginner' },
          { name: 'Dumbbell Rows', sets: 3, reps: '10-12', rest: 60, description: 'Bend at the waist with one hand on a bench, pull dumbbell toward hip with other hand, keeping elbow close to body.', gifUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80', difficulty: 'Beginner' },
          { name: 'Plank', sets: 3, reps: '30 sec', rest: 60, description: 'Hold a push-up position with weight on forearms, keeping body in a straight line from head to heels.', gifUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80', difficulty: 'Beginner' }
        ]
      },
      {
        id: 'beginner-2',
        name: 'Full Body Workout B',
        exercises: [
          { name: 'Lunges', sets: 3, reps: '10 each leg', rest: 60, description: 'Step forward with one leg, lowering your hips until both knees are bent at about a 90-degree angle.', gifUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?ixlib=rb-4.0.3', difficulty: 'Beginner' },
          { name: 'Glute Bridges', sets: 3, reps: '15-20', rest: 60, description: 'Lie on your back with knees bent, lift hips off the ground by squeezing glutes.', gifUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?ixlib=rb-4.0.3', difficulty: 'Beginner' },
          { name: 'Bird Dogs', sets: 3, reps: '10 each side', rest: 60, description: 'On hands and knees, extend opposite arm and leg while maintaining balance.', gifUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?ixlib=rb-4.0.3', difficulty: 'Beginner' }
        ]
      }
    ]
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Progressive strength training (4 days/week)',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3',
    workouts: [
      {
        id: 'intermediate-1',
        name: 'Upper Body Power',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '8-10', rest: 90, description: 'Lie on bench, lower barbell to chest, press back up.', gifUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3', difficulty: 'Intermediate' },
          { name: 'Bent Over Rows', sets: 4, reps: '10-12', rest: 90, description: 'Bend at hips, row barbell to lower chest.', gifUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3', difficulty: 'Intermediate' },
          { name: 'Shoulder Press', sets: 3, reps: '10-12', rest: 90, description: 'Press dumbbells overhead from shoulders.', gifUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3', difficulty: 'Intermediate' }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'High-intensity strength & conditioning (5 days/week)',
    image: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?ixlib=rb-4.0.3',
    workouts: [
      {
        id: 'advanced-1',
        name: 'Power & Strength',
        exercises: [
          { name: 'Deadlifts', sets: 5, reps: '5', rest: 120, description: 'Lift barbell from floor with proper form.', gifUrl: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?ixlib=rb-4.0.3', difficulty: 'Advanced' },
          { name: 'Clean & Press', sets: 4, reps: '6', rest: 120, description: 'Power clean barbell to shoulders, press overhead.', gifUrl: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?ixlib=rb-4.0.3', difficulty: 'Advanced' },
          { name: 'Front Squats', sets: 4, reps: '8', rest: 120, description: 'Squat with barbell in front rack position.', gifUrl: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?ixlib=rb-4.0.3', difficulty: 'Advanced' }
        ]
      }
    ]
  }
];

export default function WorkoutScreen() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef(null);
  const totalTimeRef = useRef(null);

  const handleSelectProgram = (program) => {
    setSelectedProgram(program);
  };
  
  const handleSelectWorkout = (workout) => {
    setSelectedWorkout(workout);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
  };

  // Start workout
  const handleStartWorkout = () => {
    setIsWorkoutActive(true);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setIsResting(false);
    setTimer(0);
    setTotalTime(0);
    
    // Start total time counter
    totalTimeRef.current = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);
  };

  // End workout
  const handleEndWorkout = () => {
    setIsWorkoutActive(false);
    setTimerActive(false);
    clearInterval(timerRef.current);
    clearInterval(totalTimeRef.current);
    
    // Reset states
    setTimer(0);
    setTotalTime(0);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setIsResting(false);
  };

  // Handle next set or exercise
  const handleNext = () => {
    const currentExercise = selectedWorkout.exercises[currentExerciseIndex];
    
    if (currentSetIndex < currentExercise.sets - 1) {
      // Move to next set
      setCurrentSetIndex(currentSetIndex + 1);
      setIsResting(true);
      startRestTimer(currentExercise.rest);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < selectedWorkout.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
        setIsResting(false);
      } else {
        // Workout complete
        handleEndWorkout();
      }
    }
  };

  // Skip rest period
  const handleSkipRest = () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    setIsResting(false);
    setTimer(0);
  };

  // Start rest timer
  const startRestTimer = (duration) => {
    let restTime = duration;
    setTimer(restTime);
    setTimerActive(true);
    
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      restTime -= 1;
      setTimer(restTime);
      
      if (restTime <= 0) {
        clearInterval(timerRef.current);
        setTimerActive(false);
        setIsResting(false);
      }
    }, 1000);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (totalTimeRef.current) {
        clearInterval(totalTimeRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Start Training</Text>
            <Text style={styles.headerTitle}>Workouts</Text>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' }} 
            style={styles.logo}
          />
        </View>
      </LinearGradient>

      {!selectedProgram && (
        <ScrollView style={styles.content}>
        {workoutPrograms.map((program) => (
          <TouchableOpacity
            key={program.id}
            style={styles.programCard}
            onPress={() => handleSelectProgram(program)}
          >
            <Image
              source={{ uri: program.image }}
              style={styles.programImage}
            />
            <View style={styles.programInfo}>
              <Text style={styles.programName}>{program.name}</Text>
              <Text style={styles.programDescription}>{program.description}</Text>
              <View style={styles.programStats}>
                <View style={styles.programStat}>
                  <Dumbbell size={16} color={Colors.brand.primary} />
                  <Text style={styles.programStatText}>{program.workouts.length} workouts</Text>
                </View>
                <View style={styles.programStat}>
                  <Flame size={16} color={Colors.brand.primary} />
                  <Text style={styles.programStatText}>
                    {program.id === 'beginner' ? 'Low' : program.id === 'intermediate' ? 'Medium' : 'High'} intensity
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={styles.customWorkoutButton}
          onPress={() => setShowLogForm(true)}
        >
          <Text style={styles.customWorkoutButtonText}>Log Custom Workout</Text>
        </TouchableOpacity>
        </ScrollView>
      )}

      {selectedProgram && !selectedWorkout && (
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedProgram(null)}
          >
            <ArrowLeft size={20} color={Colors.text.primary} />
            <Text style={styles.backButtonText}>Programs</Text>
          </TouchableOpacity>
          
          <Text style={styles.programTitle}>{selectedProgram.name} Program</Text>
          <Text style={styles.programSubtitle}>{selectedProgram.description}</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedProgram.workouts.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                onPress={() => handleSelectWorkout(workout)}
              >
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutExercises}>
                    {workout.exercises.length} exercises • {workout.exercises.reduce((total, ex) => total + ex.sets, 0)} sets
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedWorkout && !isWorkoutActive && (
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedWorkout(null)}
          >
            <ArrowLeft size={20} color={Colors.text.primary} />
            <Text style={styles.backButtonText}>Workouts</Text>
          </TouchableOpacity>
          
          <Text style={styles.workoutDetailTitle}>{selectedWorkout.name}</Text>
          <Text style={styles.workoutDetailSubtitle}>
            {selectedWorkout.exercises.length} exercises • {selectedWorkout.exercises.reduce((total, ex) => total + ex.sets, 0)} sets
          </Text>
          
          <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
            {selectedWorkout.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseCard}>
                <Image
                  source={{ uri: exercise.gifUrl }}
                  style={styles.exerciseImage}
                />
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetail}>
                    {exercise.sets} sets • {exercise.reps} reps • {exercise.rest}s rest
                  </Text>
                  <View style={[
                    styles.exerciseTag,
                    exercise.difficulty === 'Beginner' ? styles.beginnerTag :
                    exercise.difficulty === 'Intermediate' ? styles.intermediateTag :
                    styles.advancedTag
                  ]}>
                    <Text style={styles.exerciseTagText}>{exercise.difficulty}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={handleStartWorkout}
          >
            <LinearGradient
              colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
              style={styles.gradientButton}
            >
              <Play size={20} color={Colors.text.primary} style={styles.startIcon} />
              <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {isWorkoutActive && (
        <View style={styles.content}>
          <View style={styles.workoutHeader}>
            <Text style={styles.workoutHeaderTitle}>{selectedWorkout.name}</Text>
            <View style={styles.timerContainer}>
              <Text style={styles.totalTimeLabel}>Total Time: </Text>
              <Text style={styles.totalTimeValue}>{formatTime(totalTime)}</Text>
            </View>
            <View style={styles.timerContainer}>
              <Clock size={16} color={Colors.text.primary} />
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
            </View>
          </View>
          
          {isResting ? (
            <View style={styles.restContainer}>
              <Text style={styles.restTitle}>Rest Time</Text>
              <Text style={styles.restTimer}>{timer}s</Text>
              <Text style={styles.restNextUp}>
                Next up: Set {currentSetIndex + 1} of {selectedWorkout.exercises[currentExerciseIndex].name}
              </Text>
              <TouchableOpacity 
                style={styles.skipRestButton}
                onPress={handleSkipRest}
              >
                <Text style={styles.skipRestButtonText}>Skip Rest</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activeExerciseContainer}>
              <Image
                source={{ uri: selectedWorkout.exercises[currentExerciseIndex].gifUrl }}
                style={styles.activeExerciseImage}
              />
              <Text style={styles.activeExerciseName}>
                {selectedWorkout.exercises[currentExerciseIndex].name}
              </Text>
              <Text style={styles.activeExerciseSet}>
                Set {currentSetIndex + 1} of {selectedWorkout.exercises[currentExerciseIndex].sets}
              </Text>
              <Text style={styles.activeExerciseReps}>
                {selectedWorkout.exercises[currentExerciseIndex].reps}
              </Text>
              
              <TouchableOpacity 
                style={styles.completeSetButton}
                onPress={handleNext}
              >
                <LinearGradient
                  colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.completeSetButtonText}>
                    {currentSetIndex < selectedWorkout.exercises[currentExerciseIndex].sets - 1 ? 'Complete Set' : 
                     currentExerciseIndex < selectedWorkout.exercises.length - 1 ? 'Next Exercise' : 'Finish Workout'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {showLogForm && (
        <Modal
          visible={showLogForm}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLogForm(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <WorkoutLogForm 
                onSuccess={() => setShowLogForm(false)}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  programCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  programImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  programInfo: {
    padding: 16,
  },
  programName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  programDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  programStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programStatText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
  customWorkoutButton: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  customWorkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brand.primary,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 8,
  },
  programTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  programSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  workoutCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  workoutExercises: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  workoutDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  workoutDetailSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  exerciseList: {
    flex: 1,
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  exerciseDetail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  exerciseTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  beginnerTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  intermediateTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  advancedTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  exerciseTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  startWorkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  startIcon: {
    marginRight: 8,
  },
  startWorkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  totalTimeLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  totalTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 4,
  },
  restContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  restTimer: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    marginBottom: 16,
  },
  restNextUp: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  skipRestButton: {
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  skipRestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brand.primary,
  },
  activeExerciseContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  activeExerciseImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16
  },
  activeExerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center'
  },
  activeExerciseSet: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8
  },
  activeExerciseReps: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    marginBottom: 32
  },
  completeSetButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden'
  },
  completeSetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center'
  }
});