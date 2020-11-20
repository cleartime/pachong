import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/common';

@Injectable()
export class IndexService {
  constructor(private httpService: HttpService) {}
  async login() {
    const res = await this.httpService.post('https://id.app.acfun.cn/rest/web/login/signin', {
      username: '17621218285',
      password: 'Gxx562606139',
      key: '',
      captcha: ''
    }).toPromise();
    console.log('登录')
    console.log(res)
    return res.data;
  }
  async findAll(){
    const res = await this.httpService.get('https://api.xiaohuwei.cn/news.php?type=hot').toPromise();
    console.log('获取所有文章')
    return res.data
  }
  async findOne(id){
    const res = await this.httpService.get(`https://api.xiaohuwei.cn/memeda.php?id=${id}`).toPromise();
    console.log(`获取${id}详情`)
    return res.data
  }
}