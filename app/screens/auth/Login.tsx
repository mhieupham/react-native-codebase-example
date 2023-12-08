import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useTranslation} from 'react-i18next';
import Layout from '../../components/Layout';
// const AppIcon = require('../../assets/images//appicon.png');

import {useDispatch} from 'react-redux';
import {updateUser} from '../../store/userSlice';

import {login} from '../../services';
import {setSecureValue} from '../../utils/keyChain';
import {transformToFormikErrors} from '../../utils/form';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEye} from '@fortawesome/free-solid-svg-icons/faEye';
import {faEyeSlash} from '@fortawesome/free-solid-svg-icons/faEyeSlash';

interface ValuesType {
  username: string;
  password: string;
}

const initialValues: ValuesType = {username: '', password: ''};

const Login = () => {
  const dispatch = useDispatch();
  const {t} = useTranslation(['login']);

  const LoginSchema = Yup.object().shape({
    username: Yup.string()
      .min(5, 'Too Short!')
      .required(t('login:pleaseEnterInformation')),
    password: Yup.string()
      .min(5, 'Too Short!')
      .required(t('login:pleaseEnterInformation')),
  });

  const handleLogin = (values: ValuesType, {setErrors}: any) => {
    // Add grant_type value to obj
    let reqObj: any = Object.assign({}, values, {grant_type: 'password'});
    // Service request
    login(new URLSearchParams(reqObj))
      .then(res => {
        if (res.data?.user?.access_token) {
          const {name, username, access_token, refresh_token} = res.data.user;
          dispatch(updateUser({name, username, token: access_token}));
          setSecureValue('token', access_token);
          setSecureValue('refresh_token', refresh_token);
        }
      })
      .catch(e => {
        if (e.response?.data?.errors) {
          let result = transformToFormikErrors(e.response.data.errors);
          setErrors(result);
        }
      });
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.scrollview}>
        <View style={styles.container}>
          <Text style={styles.loginTitle}>{t('login:loginTitle')}</Text>
          <View style={styles.formWrapper}>
            <Formik
              initialValues={initialValues}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => {
                const isErrorName =
                  errors.username && touched.username ? errors.username : '';
                const isErrorPassword =
                  errors.password && touched.password ? errors.password : '';
                return (
                  <>
                    <View
                      style={[
                        styles.loginInputText,
                        styles.loginInputPasswordBox,
                      ]}>
                      <TextInput
                        placeholder="Nhập mã định danh"
                        onChangeText={handleChange('username')}
                        onBlur={handleBlur('username')}
                        value={values.username}
                        style={styles.loginInputLength}
                      />
                    </View>
                    <View style={styles.errorMessageBox}>
                      {isErrorName ? (
                        <Text style={[styles.loginInputTextMessageError]}>
                          {errors.username}
                        </Text>
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.loginInputText,
                        styles.loginInputPasswordBox,
                      ]}>
                      <TextInput
                        placeholder="Nhập mật khẩu"
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                        secureTextEntry={!showPassword}
                        style={styles.loginInputLength}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={togglePasswordVisibility}>
                        {showPassword ? (
                          <FontAwesomeIcon icon={faEyeSlash} />
                        ) : (
                          <FontAwesomeIcon icon={faEye} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {isErrorPassword ? (
                      <Text style={[styles.loginInputTextMessageError]}>
                        {errors.password}
                      </Text>
                    ) : null}
                    <View style={styles.rememberForgotPasswordBox}>
                      <View>
                        <BouncyCheckbox
                          size={16}
                          fillColor="#ccc"
                          innerIconStyle={
                            styles.checkboxRememberPasswordInnerIcon
                          }
                          text="Ghi nhớ mật khẩu"
                          textStyle={styles.checkboxRememberPasswordText}
                        />
                      </View>
                      <TouchableOpacity>
                        <Text style={styles.textLink}>Quên mật khẩu ?</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.buttonLogin}
                      onPress={handleSubmit}>
                      <Text>Đăng nhập</Text>
                    </TouchableOpacity>
                    <View style={styles.rememberForgotPasswordBox}>
                      <Text style={styles.textLink}>
                        Bạn chưa có tài khoản ?
                      </Text>
                      <TouchableOpacity>
                        <Text style={styles.textLink}>Đăng ký</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                );
              }}
            </Formik>
          </View>
        </View>
        <View style={styles.textVersion}>
          <Text style={styles.textLink}>ver 1.0.0</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

export default Login;

const styles = StyleSheet.create({
  scrollview: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formWrapper: {
    width: '90%',
    height: 346,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appIcon: {
    width: 50,
    height: 50,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '300',
    marginBottom: 51,
  },
  loginInputText: {
    borderColor: '#000000',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    height: 75,
  },
  loginInputLength: {
    width: '80%',
    flex: 1,
    textAlign: 'center',
  },
  loginInputPasswordBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 13,
  },
  loginInputTextMessageError: {
    color: 'red',
    marginLeft: 20,
  },
  errorMessageBox: {
    height: 25,
  },
  rememberForgotPasswordBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  checkboxRememberPasswordText: {
    fontSize: 12,
    color: '#000',
    textDecorationLine: 'none',
  },
  checkboxRememberPasswordInnerIcon: {
    borderRadius: 5,
  },
  textLink: {
    color: '#66A3FF',
  },
  buttonLogin: {
    color: '#fff',
    backgroundColor: '#F6973F',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 20,
    marginTop: 19,
  },
  textVersion: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});
