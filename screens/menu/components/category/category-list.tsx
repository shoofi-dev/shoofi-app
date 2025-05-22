import { View, StyleSheet, ScrollView, Animated } from "react-native";
import MenuItem from "../menu-item";
import CategoryItem from "./category-item";
import { useEffect, useRef } from "react";

export type TCategoryList = {
  categoryList: any;
  selectedCategory: any;
  onCategorySelect: () => any;
  isDisabledCatItem: boolean;
};
const CategoryList = ({
  categoryList,
  selectedCategory,
  onCategorySelect,
  isDisabledCatItem,
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
    <View style={styles.container}>
      <ScrollView
        style={{ height: "100%", width: "100%" }}
        showsHorizontalScrollIndicator={false}
        decelerationRate={0.5}
        horizontal={true}
      >
                  <Animated.View style={{flexDirection:'row', alignItems:'center',height:"100%", transform:[{translateX: anim.current}]}}>

        <View
          style={{
            flex: 1,
            flexWrap: "wrap",
            flexDirection: "row",
            justifyContent: "space-between",
            height:"100%",
            paddingVertical:5
          }}
        >
          {categoryList.map((category) => (
            <View
              style={{
                // width: selectedCategory._id === category._id ? 70 : 70,
              }}
              key={category._id}
            >
              <CategoryItem
                item={category}
                onItemSelect={onCategorySelect}
                selectedItem={selectedCategory}
                isDisabledCatItem={isDisabledCatItem}
              />
            </View>
          ))}
        </View>
        </Animated.View>

      </ScrollView>
    </View>
  );
};
export default CategoryList;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    height: 50,
    width: "100%",
    marginTop:15,
    // backgroundColor: "#F1F1F1",
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
