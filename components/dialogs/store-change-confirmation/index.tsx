import React from 'react';
import { View, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { useTranslation } from 'react-i18next';
import Text from '../../controls/Text';
import Button from '../../controls/button/button';
import themeStyle from '../../../styles/theme.style';

interface StoreChangeConfirmationDialogProps {
  isOpen: boolean;
  onApprove: () => void;
  onCancel: () => void;
}

const StoreChangeConfirmationDialog: React.FC<StoreChangeConfirmationDialogProps> = ({
  isOpen,
  onApprove,
  onCancel,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={onCancel}
      onBackButtonPress={onCancel}
      style={styles.modal}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.sheet}>
                <View style={styles.container}>
          <Text style={styles.title}>{t('new-store-selected')}</Text>
          <Text style={styles.message}>
            {t('store-change-confirmation-message')}
          </Text>
          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Button
                text={t('cancel')}
                onClickFn={onCancel}
                bgColor={themeStyle.WARNING_COLOR}
              />
            </View>
            <View style={styles.buttonSeparator} /> 
            <View style={styles.buttonWrapper}>
              <Button
                text={t('ok')}
                onClickFn={onApprove}
                bgColor={themeStyle.PRIMARY_COLOR}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheet: {
    backgroundColor: themeStyle.WHITE_COLOR,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 0,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    paddingHorizontal: 15,
    marginTop: 100,
    
  },
  container: {
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: themeStyle.PRIMARY_COLOR,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: themeStyle.GRAY_700,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  buttonWrapper: {
    flex: 1,
  },
  buttonSeparator: {
    width: 10,
  },
});

export default StoreChangeConfirmationDialog; 