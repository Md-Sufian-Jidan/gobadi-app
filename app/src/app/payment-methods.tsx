import React from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  detail: string;
  isDefault: boolean;
  isVerified: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: '1', type: 'bKash', label: 'Personal Account', detail: 'G•••••••', isDefault: true, isVerified: false, icon: 'b', iconBg: '#E53935', iconColor: '#FFFFFF' },
  { id: '2', type: 'Nagad', label: 'Personal Account', detail: 'G•••••••', isDefault: false, isVerified: false, icon: 'n', iconBg: '#FF9800', iconColor: '#FFFFFF' },
  { id: '3', type: 'Visa', label: 'Debit Card', detail: '•••• •••• •••• 3421', isDefault: false, isVerified: false, icon: 'V', iconBg: '#1A237E', iconColor: '#FFFFFF' },
  { id: '4', type: 'Mastercard', label: 'Credit Card', detail: '•••• •••• •••• 7788', isDefault: false, isVerified: true, icon: 'M', iconBg: '#E53935', iconColor: '#FFFFFF' },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {PAYMENT_METHODS.map((method) => (
          <View
            key={method.id}
            style={[styles.methodCard, method.isDefault && styles.methodCardDefault]}
          >
            <View style={styles.methodLeft}>
              <View style={[styles.methodIcon, { backgroundColor: method.iconBg }]}>
                <Text style={[styles.methodIconText, { color: method.iconColor }]}>{method.icon}</Text>
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTypeRow}>
                  <Text style={styles.methodType}>{method.type}</Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                  {method.isVerified && (
                    <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  )}
                </View>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodDetail}>{method.detail}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
              <Ionicons name="ellipsis-vertical" size={16} color="#9C9690" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/add-payment-method')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1817' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  methodCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#E6E1DC', padding: 14, marginBottom: 10 },
  methodCardDefault: { borderColor: '#BD632F', backgroundColor: '#FFF8F4' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  methodIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  methodIconText: { fontSize: 16, fontWeight: '800' },
  methodInfo: { flex: 1 },
  methodTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  methodType: { fontSize: 14, fontWeight: '700', color: '#1A1817' },
  defaultBadge: { backgroundColor: '#FFF2EB', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  defaultText: { fontSize: 10, fontWeight: '700', color: '#BD632F' },
  methodLabel: { fontSize: 12, fontWeight: '500', color: '#7C7672', marginBottom: 1 },
  methodDetail: { fontSize: 12, fontWeight: '500', color: '#9C9690' },
  menuBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  addBtn: { flexDirection: 'row', backgroundColor: '#BD632F', borderRadius: 26, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 10 },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
