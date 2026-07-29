import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetAnimalsQuery } from '@/store/animalsApi';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useToggleTaskMutation,
  useDeleteTaskMutation,
} from '@/store/tasksApi';
import { EmptyState } from '@/components/ui/empty-state';
import { RowSkeleton } from '@/components/ui/skeleton';

interface AnimalStats {
  cow: number;
  goat: number;
  buffalo: number;
}

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTaskTime(scheduledTime: string): string {
  return new Date(scheduledTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function countByBreed(animals: { breed: string }[]): AnimalStats {
  const stats: AnimalStats = { cow: 0, goat: 0, buffalo: 0 };
  for (const a of animals) {
    const breed = a.breed.toLowerCase();
    if (breed.includes('cow')) stats.cow += 1;
    else if (breed.includes('goat')) stats.goat += 1;
    else if (breed.includes('buffalo')) stats.buffalo += 1;
  }
  return stats;
}

export default function MyTaskScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: tasks = [], isLoading: isTasksLoading } = useGetTasksQuery(todayDateKey());
  const { data: animals = [] } = useGetAnimalsQuery();
  const stats = countByBreed(animals);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [createTask] = useCreateTaskMutation();
  const [toggleTaskMutation] = useToggleTaskMutation();
  const [deleteTaskMutation] = useDeleteTaskMutation();

  async function addTask() {
    const title = newTaskTitle.trim();
    if (!title) return;
    setNewTaskTitle('');
    try {
      await createTask({ title, scheduledTime: new Date().toISOString() }).unwrap();
    } catch (err) {
      console.log('Error creating task:', err);
    }
  }

  function toggleTask(id: number) {
    toggleTaskMutation(String(id));
  }

  function deleteTask(id: number) {
    deleteTaskMutation(String(id));
  }

  const menuItems = [
    { id: '1', label: 'My Farm', icon: '📈', route: '/(tabs)' },
    { id: '2', label: 'Notification', icon: '🔔', route: null },
    { id: '3', label: 'Language', icon: '🔤', route: null },
    { id: '4', label: 'Refer & Earn', icon: '🎁', route: null },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Task</Text>

        <TouchableOpacity style={styles.circleButton} activeOpacity={0.8}>
          <Text style={styles.buttonText}>📅</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfoRow}>
            <Image
              source={require('@/assets/images/user_profile.png')}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || user?.phone || 'Farmer'}</Text>
              <Text style={styles.userSubtitle} numberOfLines={1}>
                {user?.phone || ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.8}
            >
              <Text style={styles.editText}>Edit ✏️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, styles.statBoxBlue]}>
              <Text style={[styles.statNumber, styles.statNumberBlue]}>{String(stats.cow).padStart(2, '0')}</Text>
              <Text style={styles.statLabel}>Cow</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxOrange]}>
              <Text style={[styles.statNumber, styles.statNumberOrange]}>{String(stats.goat).padStart(2, '0')}</Text>
              <Text style={styles.statLabel}>Goat</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxPink]}>
              <Text style={[styles.statNumber, styles.statNumberPink]}>{String(stats.buffalo).padStart(2, '0')}</Text>
              <Text style={styles.statLabel}>Buffalo</Text>
            </View>
          </View>
        </View>

        {/* Task List */}
        <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
        <View style={styles.taskListCard}>
          {isTasksLoading ? (
            <>
              <RowSkeleton />
              <RowSkeleton />
            </>
          ) : tasks.length === 0 ? (
            <EmptyState compact title="No tasks for today yet" />
          ) : (
            tasks.map((task, idx) => (
              <View
                key={task.id}
                style={[styles.taskRow, idx === tasks.length - 1 && { borderBottomWidth: 0 }]}
              >
                <TouchableOpacity
                  style={styles.taskRowLeft}
                  activeOpacity={0.7}
                  onPress={() => toggleTask(task.id)}
                >
                  <View style={[styles.checkbox, task.isDone ? styles.checkboxChecked : styles.checkboxUnchecked]}>
                    {task.isDone ? <Text style={styles.checkIcon}>✓</Text> : null}
                  </View>
                  <View style={styles.taskTextContainer}>
                    <Text style={[styles.taskTitle, task.isDone && styles.taskTitleDone]}>{task.title}</Text>
                    <Text style={styles.taskTime}>{formatTaskTime(task.scheduledTime)}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(task.id)} activeOpacity={0.7} style={styles.deleteButton}>
                  <Text style={styles.deleteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={styles.addTaskRow}>
            <TextInput
              style={styles.addTaskInput}
              placeholder="Add a task..."
              placeholderTextColor="#A39E99"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              onSubmitEditing={addTask}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addTaskButton} onPress={addTask} activeOpacity={0.8}>
              <Text style={styles.addTaskButtonText}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Plan Card */}
        <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
          <View style={styles.planDetails}>
            <Text style={styles.planLabel}>Current Plan</Text>
            <Text style={styles.planCost}>$99.00</Text>
            <Text style={styles.planBilling}>Next Billing : Oct 15, 2026</Text>
          </View>
          <Text style={styles.planChevron}>❯</Text>
        </TouchableOpacity>

        {/* Menu List */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => item.route && router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Text style={styles.menuChevron}>❯</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 12,
  },
  taskListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE1',
  },
  taskRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#9C9690',
  },
  taskTime: {
    fontSize: 12,
    color: '#7C7672',
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  checkboxUnchecked: {
    borderWidth: 1.5,
    borderColor: '#E6E1DC',
    backgroundColor: '#FFFFFF',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 14,
    color: '#C4C0BB',
    fontWeight: '700',
  },
  addTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 10,
  },
  addTaskInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1A1817',
  },
  addTaskButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 20,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1817',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 12,
    color: '#9C9690',
  },
  editButton: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1817',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#FAF9F6',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statBoxBlue: {
    backgroundColor: '#F3F6FF',
    borderColor: '#D4E2FF',
  },
  statBoxOrange: {
    backgroundColor: '#FFF7F3',
    borderColor: '#FFE3D4',
  },
  statBoxPink: {
    backgroundColor: '#FFF2F6',
    borderColor: '#FFD4E2',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statNumberBlue: {
    color: '#1976D2',
  },
  statNumberOrange: {
    color: '#BD632F',
  },
  statNumberPink: {
    color: '#D81B60',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C7672',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F6FC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D2E2FA',
    padding: 20,
    marginBottom: 20,
  },
  planDetails: {
    flex: 1,
  },
  planLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
    marginBottom: 4,
  },
  planCost: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 4,
  },
  planBilling: {
    fontSize: 11,
    color: '#657786',
    fontWeight: '500',
  },
  planChevron: {
    fontSize: 14,
    color: '#BD632F',
    fontWeight: '700',
  },
  menuList: {
    gap: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 20,
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 16,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  menuChevron: {
    fontSize: 12,
    color: '#9C9690',
  },
});
