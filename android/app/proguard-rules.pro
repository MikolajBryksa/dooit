########################################
# REACT NATIVE / HERMES
########################################
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn com.facebook.jni.**

########################################
# REACT NATIVE CONFIG (react-native-config)
########################################
-keep class com.lugg.RNCConfig.** { *; }

# Dodatkowo: nie obfuskować BuildConfig, bo tam lądują pola z configu
-keep class **.BuildConfig { *; }

########################################
# REALM (wg dokumentacji)
########################################
-keep class io.realm.annotations.RealmModule
-keep @io.realm.annotations.RealmModule class *
-keep class io.realm.internal.Keep
-keep @io.realm.internal.Keep class *
-keep class io.realm.** { *; }
-dontwarn io.realm.**

########################################
# JSON SERIALIZATION / METADATA
########################################
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes InnerClasses
-keepattributes EnclosingMethod
