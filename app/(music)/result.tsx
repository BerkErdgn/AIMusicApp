import { View, Text, StyleSheet } from 'react-native';
import { SystemColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function ResultPage() {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, Typography.largeTitle]}>Your Music</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SystemColors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: SystemColors.white,
  }
}); 