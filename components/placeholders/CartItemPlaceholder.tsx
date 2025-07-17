import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import themeStyle from '../../styles/theme.style';

const { width } = Dimensions.get('window');

const Placeholder = ({ style }) => <View style={[styles.placeholder, style]} />;

const CartItemPlaceholder = () => {
  return (
    <View style={styles.container}>
      {/* Right side: name and image */}
      <View style={styles.rightSection}>
        <View style={styles.nameRow}>
          <Placeholder style={styles.itemName} />
          <Placeholder style={styles.itemImage} />
        </View>
        <Placeholder style={styles.price} />
      </View>
      {/* Left side: counter */}
      <View style={styles.leftSection}>
        <View style={styles.counterBox}>
          <Placeholder style={styles.counterIcon} />
          <Placeholder style={styles.counterNumber} />
          <Placeholder style={styles.counterIcon} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeStyle.WHITE_COLOR,
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholder: {
    backgroundColor: '#E1E9EE',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    width: width * 0.3,
    height: 18,
    borderRadius: 4,
    marginLeft: 8,
  },
  itemImage: {
    width: 40,
    height: 28,
    borderRadius: 4,
  },
  price: {
    width: 50,
    height: 16,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
    marginLeft: 50,
  },
  leftSection: {
    marginLeft: 10,
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 90,
    justifyContent: 'space-between',
  },
  counterIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  counterNumber: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default CartItemPlaceholder; 