var app = angular.module("expressApp", []);
app.filter('trustHtml', function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input);
    }
});
app.controller("expressCtrl",["$scope", "$http", function ($scope, $http) {
    //初始化配置
    $scope.config = {
        dogList_show: false,
        current_page: 1,//当前页码
        page_size: 24,//每页显示条数
        type_list: [],//获取品种列表
        level_list: [],//获取品级列表
        city_list: [],//获取城市列表
        type_value: [],//筛选品种
        level_value: [],//筛选品级
        city_value: [],//筛选城市
        type_value_string: '',
        level_value_string: '',
        city_value_string: '',
        type_list_show: false,
        level_list_show: false,
        city_list_show: false,
        saleIn: false,
        isNew: false,
        champion: false,
        isVideo: false,
        price: '',
        sale: '',
        evaluation: ''
    };
    $(window).scroll(function() {
        $('.left').css('left',-$(window).scrollLeft() + 'px');
        $('.header,.footer').css({
            'left': -$(window).scrollLeft() + 240 + 'px',
            'right': '0'
        })
    });
    $(window).scroll();
    $scope.close = function (e) {
        if(!($(e.target).parent().is('.list_type') || e.target.id === 'type' || e.target.id === 'level' || e.target.id === 'city')){
            $scope.config.type_list_show = false;
            $scope.config.level_list_show = false;
            $scope.config.city_list_show = false;
        }
    };
    //获取品种列表
    $scope.getType = function () {
        $http({
            method: 'get',
            url: '/getType'
        }).then(function (res) {
            if(res.data.success){
                var list = [];
                angular.forEach(res.data.data.type, function (value, index) {
                    this.push({
                        'index': index,
                        'name': value,
                        'isChecked': false
                    })
                }, list);
                $scope.config.type_list = list;
            }
        });
    };
    //获取品级列表
    $scope.getLevel = function () {
        $http({
            method: 'get',
            url: '/getLevel'
        }).then(function (res) {
            if(res.data.success){
                var list = [];
                angular.forEach(res.data.data.level, function (value, index) {
                    this.push({
                        'index': index,
                        'name': value,
                        'isChecked': false
                    })
                }, list);
                $scope.config.level_list = list;
            }
        });
    };
    //获取城市列表
    $scope.getCity = function () {
        $http({
            method: 'get',
            url: '/getCity'
        }).then(function (res) {
            if(res.data.success){
                var list = [];
                angular.forEach(res.data.data.city, function (value, index) {
                    this.push({
                        'index': index,
                        'name': value,
                        'isChecked': false
                    })
                }, list);
                $scope.config.city_list = list;
            }
        });
    };
    $scope.getType();
    $scope.getLevel();
    $scope.getCity();
    $scope.change = function (type, name) {
        if(type === 'type' || type === 'level' || type === 'city'){
            if($scope.config[type + '_list'][this.$index].isChecked){
                $scope.config[type + '_value'].push(name);
            }else{
                $scope.config[type + '_value'].splice($scope.config[type + '_value'].indexOf(name), 1);
            }
            if($scope.config[type + '_value'].length){
                $scope.config[type + '_value_string'] = $scope.config[type + '_value'].join(',');
            }else{
                $scope.config[type + '_value_string'] = '';
            }
        }
        if(type === 'sale'){
            if(!$scope.config.sale){
                $scope.config.sale = 'highToLow';
            }else if($scope.config.sale === 'highToLow'){
                $scope.config.sale = 'lowToHigh';
            }else if($scope.config.sale === 'lowToHigh'){
                $scope.config.sale = '';
            }
            $scope.config.evaluation = '';
            $scope.config.price = '';
        }else if(type === 'evaluation'){
            if(!$scope.config.evaluation){
                $scope.config.evaluation = 'highToLow';
            }else if($scope.config.evaluation === 'highToLow'){
                $scope.config.evaluation = 'lowToHigh';
            }else if($scope.config.evaluation === 'lowToHigh'){
                $scope.config.evaluation = '';
            }
            $scope.config.sale = '';
            $scope.config.price = '';
        }else if(type === 'price'){
            if(!$scope.config.price){
                $scope.config.price = 'lowToHigh';
            }else if($scope.config.price === 'lowToHigh'){
                $scope.config.price = 'highToLow';
            }else if($scope.config.price === 'highToLow'){
                $scope.config.price = '';
            }
            $scope.config.sale = '';
            $scope.config.evaluation = '';
        }

        $scope.search();
    };
    $scope.search = function (isPage) {
        if(!isPage){
            $scope.config.current_page = 1;
        }
        $scope.config.dogList_show = false;
        $http({
            method: 'get',
            url: '/search',
            params: {
                page: $scope.config.current_page,//当前页码
                size: $scope.config.page_size,//每页显示条数
                type: $scope.config.type_value_string,//品种
                level: $scope.config.level_value_string,//品级
                city: $scope.config.city_value_string,//城市
                saleIn: $scope.config.saleIn,//只显示在售
                isNew: $scope.config.isNew,//只显示最新
                champion: $scope.config.champion,//只显示月销冠军
                isVideo: $scope.config.isVideo,//只显示有小视频
                price : $scope.config.price,//价格排序
                sale : $scope.config.sale,//销量排序
                evaluation : $scope.config.evaluation//评价排序
            }
        }).then(function (res) {
            if(res.data.success){
                $scope.list = res.data.data;
                $scope.config.dogList_show = true;
                if(!isPage){
                    $('#page').createPage({
                        current:1,
                        pageCount:Math.ceil(res.data.total/24),
                        backFn:function (n) {
                            $scope.config.current_page = n;
                            $scope.search(true);
                        },
                        isJump:true
                    });
                }
            }
        });
    };
    $scope.search();
}]);