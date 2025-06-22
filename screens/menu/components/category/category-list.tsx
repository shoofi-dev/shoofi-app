import { View, StyleSheet, ScrollView, Animated } from "react-native";
import MenuItem from "../menu-item";
import CategoryItem from "./category-item";
import { useEffect, useRef } from "react";

export type TCategoryList = {
  categoryList: any;
  selectedCategory: any;
  onCategorySelect: () => any;
  isDisabledCatItem: boolean;
  style?: any;
};
const CategoryList = ({
  categoryList,
  selectedCategory,
  onCategorySelect,
  isDisabledCatItem,
  style,
}) => {

  useEffect(() => {
    setTimeout(() => {
      categoryListScroll();

    }, 1000);

  }, []);

  const handleMenuAnimScrollEnd = () => {

    // setMenuAnimationDone(true);
    //   productsAnimate();

  }

  const anim = useRef(new Animated.Value(10));

  const categoryListScroll = ()=> {
      Animated.timing(anim.current, {
        toValue:300,
        duration: 600,
        useNativeDriver: true,
  
      }).start(()=>{
        Animated.timing(anim.current, {
          toValue:-10,
          duration: 600,
          useNativeDriver: true,
    
        }).start(()=>{
          setTimeout(() => {
            handleMenuAnimScrollEnd()
          }, 0);
        });
     
      });


  };
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        style={{ height: "100%", width: "100%" }}
        showsHorizontalScrollIndicator={false}
        decelerationRate={0.5}
        horizontal={true}
        contentContainerStyle={styles.scrollContent}
      >
        {categoryList.map((category) => (
          <CategoryItem
            key={category._id}
            item={category}
            onItemSelect={onCategorySelect}
            selectedItem={selectedCategory}
            isDisabledCatItem={isDisabledCatItem}
          />
        ))}
      </ScrollView>
    </View>
  );
};
export default CategoryList;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    height: 56,
    width: "100%",
    marginTop: 5,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  categoryItem: {},
  iconContainer: {},
  itemsListConainer: {
    top: 120,
    position: "absolute",
    alignSelf: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 10,
    bottom: 0,
    zIndex: -1,
  },
});
