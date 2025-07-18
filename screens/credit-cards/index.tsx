import React, { useEffect, useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { observer } from 'mobx-react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StoreContext } from '../../stores';
import { CreditCard } from '../../stores/creditCards';
import Text from '../../components/controls/Text';
import Icon from '../../components/icon';
import BackButton from '../../components/back-button';
import Button from '../../components/controls/button/button';
import themeStyle from '../../styles/theme.style';
import { useResponsive } from '../../hooks/useResponsive';
import { DIALOG_EVENTS } from '../../consts/events';
import NewPaymentMethodBasedEventDialog from '../../components/dialogs/new-credit-card-based-event';

const CreditCardsScreen = ({ onClose, isModal = false }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { creditCardsStore } = useContext(StoreContext);
  const { scale, fontSize } = useResponsive();
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  useEffect(() => {
    loadCreditCards();
  }, []);

  const loadCreditCards = async () => {
    try {
      await creditCardsStore.fetchCreditCards();
    } catch (error) {
      console.error('Failed to load credit cards:', error);
    }
  };

  const handleAddCard = () => {
    onClose();
    setTimeout(() => {
    DeviceEventEmitter.emit(
        DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG
      );    
    }, 500);
  };

  const handleEditCard = (card: CreditCard) => {
    if (isModal) {
      onClose();
    } else {
      (navigation as any).navigate('edit-credit-card', { card });
    }
  };

  const handleDeleteCard = (card: CreditCard) => {
    Alert.alert(
      t('delete-credit-card'),
      t('delete-credit-card-confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await creditCardsStore.deleteCreditCard(card._id);
              Alert.alert(t('success'), t('credit-card-deleted'));
            } catch (error) {
              Alert.alert(t('error'), t('failed-to-delete-credit-card'));
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (card: CreditCard) => {
    try {
      if(card.isDefault) {
        return;
      }
      await creditCardsStore.setDefaultCreditCard(card._id);
      loadCreditCards();

      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      Alert.alert(t('error'), t('failed-to-update-default-card'));
    }
  };

  const renderCreditCard = (card: CreditCard) => (
    <TouchableOpacity  onPress={() => handleSetDefault(card)} key={card._id} style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Icon
            icon={card.ccType}
            size={40}
            style={styles.cardIcon}
          />
            <Text style={styles.cardNumber}>
              **** **** **** {card.last4Digits}
            </Text>
            {/* <Text style={styles.cardHolder}>
              {card.holderName}
            </Text> */}
            {/* {card.isDefault && (
                <Icon icon="v" size={20} color={themeStyle.SUCCESS_COLOR}  />
            )} */}
        </View>
        
        <View style={styles.cardActions}>
   
             {card.isDefault && (
                <Icon icon="v" size={30} color={themeStyle.SUCCESS_COLOR}  />
            )}
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteCard(card)}
          >
            <Icon icon="trash" size={20} style={[styles.actionIcon, styles.deleteIcon]} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{position: 'absolute', left: 15, top: 15}}>
          <BackButton onClick={onClose} isDisableGoBack={true} color={themeStyle.WHITE_COLOR}/>
        </View>
        <View style={{ alignSelf: 'center'}}>
        <Text style={styles.title}>{t('credit-cards')}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {creditCardsStore.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeStyle.PRIMARY_COLOR} />
          </View>
        ) : creditCardsStore.creditCards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon icon="credit-card" size={80} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>{t('no-credit-cards')}</Text>
            <Text style={styles.emptySubtitle}>{t('add-your-first-credit-card')}</Text>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {creditCardsStore.creditCards.map(renderCreditCard)}
            <TouchableOpacity onPress={handleAddCard} style={styles.addCardContainer}>
              <Icon icon="plus" size={15} color={themeStyle.SUCCESS_COLOR} style={styles.addCardIcon} />
              <Text style={styles.addCardText}>{t('add-credit-card')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* <View style={styles.footer}>
        <Button
          onClickFn={handleAddCard}
          text={t('add-credit-card')}
          fontSize={fontSize(18)}
          textColor={themeStyle.WHITE_COLOR}
          borderRadious={50}
          textPadding={0}
        />
      </View> */}
      <NewPaymentMethodBasedEventDialog />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.WHITE_COLOR,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    marginHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    color: themeStyle.GRAY_600,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: themeStyle.GRAY_600,
    textAlign: 'center',
  },
  cardsList: {
    paddingVertical: 20,
  },
  cardContainer: {
    backgroundColor: themeStyle.GRAY_10,
    borderRadius: 4,
    padding: 5,
    marginBottom: 15,

    borderColor: themeStyle.GRAY_600,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    color: themeStyle.GRAY_700,
    marginRight: 10,
  },
  cardDetails: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 5,
  },
  cardHolder: {
    fontSize: 14,
    color: themeStyle.GRAY_600,
    marginBottom: 5,
  },
  defaultBadge: {
    backgroundColor: themeStyle.SUCCESS_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontSize: 12,
    color: themeStyle.WHITE_COLOR,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  actionIcon: {
    color: themeStyle.PRIMARY_COLOR,
  },
  deleteIcon: {
    color: themeStyle.ERROR_COLOR,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: themeStyle.GRAY_600,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  addCardText: {
    fontSize: 16,
    color: themeStyle.SUCCESS_COLOR,
    marginLeft: 10,
  },
  addCardIcon: {
    marginRight: 10,
  },
  addCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
});

export default observer(CreditCardsScreen); 