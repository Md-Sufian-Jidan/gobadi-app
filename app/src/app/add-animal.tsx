import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import {
  useGetAnimalByIdQuery,
  useAddAnimalMutation,
  useUpdateAnimalMutation,
} from '@/store/animalsApi';

export default function AddAnimalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.edit ? String(params.id || '') : '';
  const [step, setStep] = useState(1); // 1: Info, 2: Details, 3: Visual, 4: Pricing

  // Form State
  const [name, setName] = useState(editId ? '' : 'Donald Tramp');
  const [description, setDescription] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  const [source, setSource] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [joinedFarm, setJoinedFarm] = useState('');
  const [weight, setWeight] = useState('');
  const [liveWeight, setLiveWeight] = useState('');
  const [reproStatus, setReproStatus] = useState('');
  const [color, setColor] = useState('');

  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);

  const [photoCost, setPhotoCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [liveWeightPrice, setLiveWeightPrice] = useState('');

  // Dropdown States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; options: string[]; onSelect: (val: string) => void }>({
    title: '',
    options: [],
    onSelect: () => {},
  });

  const openDropdown = (title: string, options: string[], onSelect: (val: string) => void) => {
    setModalData({ title, options, onSelect });
    setModalVisible(true);
  };

  const { data: existingAnimal } = useGetAnimalByIdQuery(editId, { skip: !editId });
  const [addAnimal] = useAddAnimalMutation();
  const [updateAnimal] = useUpdateAnimalMutation();

  useEffect(() => {
    if (!existingAnimal) return;
    setName(existingAnimal.name);
    setBreed(existingAnimal.breed);
    setWeight(existingAnimal.weight);
    setAge(existingAnimal.age);
    setColor(existingAnimal.color);
  }, [existingAnimal]);

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      try {
        const payload = {
          name: name || 'Donald Tramp',
          breed: breed || 'Albino Buffalo',
          weight: weight || '725 Kg',
          age: age || '8 months',
          color: color || 'Cream-white',
        };
        if (editId) {
          await updateAnimal({ id: editId, data: payload }).unwrap();
        } else {
          await addAnimal(payload).unwrap();
        }
      } catch (err) {
        console.log('Error saving animal:', err);
      }
      router.replace('/(tabs)/animals');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{editId ? 'Edit Animal' : 'Add New Animal'}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicatorContainer}>
          <View style={styles.stepsRow}>
            {/* Step 1 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, step >= 1 ? styles.stepDotActive : styles.stepDotInactive]}>
                {step > 1 ? <Text style={styles.stepCheck}>✓</Text> : <View style={styles.stepInnerDot} />}
              </View>
              <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>Info</Text>
            </View>

            <View style={[styles.stepLine, step >= 2 ? styles.stepLineActive : styles.stepLineInactive]} />

            {/* Step 2 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, step >= 2 ? styles.stepDotActive : styles.stepDotInactive]}>
                {step > 2 ? <Text style={styles.stepCheck}>✓</Text> : step === 2 ? <View style={styles.stepInnerDot} /> : null}
              </View>
              <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>Details</Text>
            </View>

            <View style={[styles.stepLine, step >= 3 ? styles.stepLineActive : styles.stepLineInactive]} />

            {/* Step 3 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, step >= 3 ? styles.stepDotActive : styles.stepDotInactive]}>
                {step > 3 ? <Text style={styles.stepCheck}>✓</Text> : step === 3 ? <View style={styles.stepInnerDot} /> : null}
              </View>
              <Text style={[styles.stepLabel, step === 3 && styles.stepLabelActive]}>Visual</Text>
            </View>

            <View style={[styles.stepLine, step >= 4 ? styles.stepLineActive : styles.stepLineInactive]} />

            {/* Step 4 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, step >= 4 ? styles.stepDotActive : styles.stepDotInactive]}>
                {step === 4 ? <View style={styles.stepInnerDot} /> : null}
              </View>
              <Text style={[styles.stepLabel, step === 4 && styles.stepLabelActive]}>Pricing</Text>
            </View>
          </View>
        </View>

        {/* Scrollable form */}
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View style={styles.formStep}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name*</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter name"
                  placeholderTextColor="#A39E99"
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description*</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add descriptions of the animal"
                  placeholderTextColor="#A39E99"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Date of Birth */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth <Text style={styles.optional}>(optional)</Text></Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => openDropdown('Date of Birth', ['31/01/2025', '12/12/2024', '01/01/2024'], setDob)}
                >
                  <Text style={[styles.dropdownValue, !dob && styles.placeholder]}>
                    {dob || 'Add date of birth'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Gender */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender*</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => openDropdown('Gender', ['Male', 'Female'], setGender)}
                >
                  <Text style={[styles.dropdownValue, !gender && styles.placeholder]}>
                    {gender || 'Select gender'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.formStep}>
              {/* Source */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Source <Text style={styles.optional}>(optional)</Text></Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => openDropdown('Source', ['Purchased', 'Born in Farm', 'Leased'], setSource)}
                >
                  <Text style={[styles.dropdownValue, !source && styles.placeholder]}>
                    {source || 'Select source'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Breed */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Breed <Text style={styles.optional}>(optional)</Text></Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => openDropdown('Breed', ['Albanian', 'Bangladeshi Cow', 'Gir', 'Holstein'], setBreed)}
                >
                  <Text style={[styles.dropdownValue, !breed && styles.placeholder]}>
                    {breed || 'Select breed'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Age */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Age <Text style={styles.optional}>(optional)</Text></Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => openDropdown('Age', ['6 months', '12 months', '18 months', '28 months'], setAge)}
                >
                  <Text style={[styles.dropdownValue, !age && styles.placeholder]}>
                    {age || 'Select farm joined date'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Joined Farm */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Joined Farm <Text style={styles.optional}>(optional)</Text></Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => openDropdown('Joined Farm', ['12/12/2024', '01/01/2025'], setJoinedFarm)}
                >
                  <Text style={[styles.dropdownValue, !joinedFarm && styles.placeholder]}>
                    {joinedFarm || 'Select farm joined date'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Weight */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weight*</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Add weight when joined farm"
                  placeholderTextColor="#A39E99"
                  keyboardType="numeric"
                />
              </View>

              {/* Live Weight */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Live Weight <Text style={styles.optional}>(optional)</Text></Text>
                <TextInput
                  style={styles.input}
                  value={liveWeight}
                  onChangeText={setLiveWeight}
                  placeholder="Add live weight"
                  placeholderTextColor="#A39E99"
                  keyboardType="numeric"
                />
              </View>

              {/* Reproductive Status */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reproductive Status <Text style={styles.optional}>(optional)</Text></Text>
                <TextInput
                  style={styles.input}
                  value={reproStatus}
                  onChangeText={setReproStatus}
                  placeholder="Add reproductive status"
                  placeholderTextColor="#A39E99"
                />
              </View>

              {/* Color */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Color*</Text>
                <TextInput
                  style={styles.input}
                  value={color}
                  onChangeText={setColor}
                  placeholder="Add animal color"
                  placeholderTextColor="#A39E99"
                />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.formStep}>
              <Text style={styles.stepTitle}>Upload Visuals</Text>
              <Text style={styles.stepSubtitle}>Add high-quality photos of your animal from multiple angles.</Text>

              <TouchableOpacity style={styles.uploadArea} activeOpacity={0.7}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadLabel}>Upload Animal Photos</Text>
                <Text style={styles.uploadLimit}>Support JPG, PNG up to 10MB</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 4 && (
            <View style={styles.formStep}>
              {/* Photo* / Purchase Cost */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Photo*</Text>
                <TextInput
                  style={styles.input}
                  value={photoCost}
                  onChangeText={setPhotoCost}
                  placeholder="Add purchase cost"
                  placeholderTextColor="#A39E99"
                  keyboardType="numeric"
                />
              </View>

              {/* Selling Price (optional) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Selling Price <Text style={styles.optional}>(optional)</Text></Text>
                <TextInput
                  style={styles.input}
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  placeholder="Add selling price"
                  placeholderTextColor="#A39E99"
                  keyboardType="numeric"
                />
              </View>

              {/* Live Weight Price (optional) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Live Weight Price <Text style={styles.optional}>(optional)</Text></Text>
                <TextInput
                  style={styles.input}
                  value={liveWeightPrice}
                  onChangeText={setLiveWeightPrice}
                  placeholder="Add selling price"
                  placeholderTextColor="#A39E99"
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {/* Button Row */}
          <View style={styles.buttonRow}>
            {step > 1 ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
              <Text style={styles.nextButtonText}>{step === 4 ? 'Add Animal' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Selector Dropdown Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalData.title}</Text>
            <FlatList
              data={modalData.options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    modalData.onSelect(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1817',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBEBEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '700',
  },
  stepIndicatorContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 50,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepDotActive: {
    borderColor: '#BD632F',
    backgroundColor: '#FFFFFF',
  },
  stepDotInactive: {
    borderColor: '#E6E1DC',
    backgroundColor: '#FFFFFF',
  },
  stepInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#BD632F',
  },
  stepCheck: {
    color: '#BD632F',
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    color: '#9C9690',
    marginTop: 6,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#BD632F',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginTop: -16,
  },
  stepLineActive: {
    backgroundColor: '#BD632F',
  },
  stepLineInactive: {
    backgroundColor: '#E6E1DC',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formStep: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 18,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1817',
    marginBottom: 8,
  },
  optional: {
    color: '#9C9690',
    fontWeight: '400',
    fontSize: 13,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1A1817',
  },
  textArea: {
    height: 120,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
  },
  dropdownValue: {
    fontSize: 15,
    color: '#1A1817',
  },
  placeholder: {
    color: '#A39E99',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#7C7672',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#7C7672',
    marginBottom: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#E6E1DC',
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  uploadLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1817',
    marginBottom: 4,
  },
  uploadLimit: {
    fontSize: 12,
    color: '#9C9690',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6E1DC',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1817',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#BD632F',
  },
  toggleInactive: {
    backgroundColor: '#E6E1DC',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  thumbInactive: {
    alignSelf: 'flex-start',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#A39E99',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1.5,
    backgroundColor: '#BD632F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF9F6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1A1817',
    textAlign: 'center',
  },
});
